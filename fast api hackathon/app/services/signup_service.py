import secrets
import string

from fastapi import HTTPException, status

from app.db.patient_repository import PatientRepository
from app.db.supabase import SupabaseServiceRoleGateway
from app.schemas.auth import PatientSignupRequest, PatientSignupResponse


class SignupService:
    def __init__(
        self,
        service_role_gateway: SupabaseServiceRoleGateway,
        patient_repository: PatientRepository,
    ) -> None:
        self.service_role_gateway = service_role_gateway
        self.patient_repository = patient_repository

    async def signup_patient(self, payload: PatientSignupRequest) -> PatientSignupResponse:
        auth_user = await self.service_role_gateway.create_auth_user(
            email=str(payload.email),
            password=payload.password,
            metadata={
                "name": payload.full_name,
                "full_name": payload.full_name,
                "role": "patient",
            },
        )
        auth_user_id = auth_user.get("id")
        if not auth_user_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Supabase did not return an auth user id.",
            )

        try:
            profile = await self.patient_repository.create_profile(
                data_client=self.service_role_gateway,
                payload={
                    "id": auth_user_id,
                    "email": str(payload.email),
                    "full_name": payload.full_name,
                    "role": "patient",
                },
            )
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Profile row was not created.",
                )

            vital_id = await self._generate_unique_vital_id()
            patient = await self.patient_repository.create_patient(
                data_client=self.service_role_gateway,
                payload={
                    "user_id": auth_user_id,
                    "vital_id": vital_id,
                    "full_name": payload.full_name,
                    "role": "patient",
                    "blood_group": payload.blood_group,
                    "dob": payload.dob.isoformat(),
                    "emergency_contact": payload.emergency_contact,
                    "allergies": payload.allergies,
                },
            )
            if not patient:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Patient row was not created.",
                )

            await self.patient_repository.create_default_visibility_settings(
                data_client=self.service_role_gateway,
                patient_id=patient["id"],
            )
        except Exception:
            await self._rollback_auth_user(auth_user_id)
            raise

        return PatientSignupResponse(
            auth_user_id=auth_user_id,
            profile_id=profile["id"],
            patient_id=patient["id"],
            vital_id=vital_id,
            email=payload.email,
            full_name=payload.full_name,
            role="patient",
        )

    async def _generate_unique_vital_id(self) -> str:
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(10):
            vital_id = "VID-" + "".join(secrets.choice(alphabet) for _ in range(6))
            existing = await self.patient_repository.get_patient_by_vital_id(
                data_client=self.service_role_gateway,
                vital_id=vital_id,
            )
            if not existing:
                return vital_id

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to generate a unique VitalID. Please try again.",
        )

    async def _rollback_auth_user(self, auth_user_id: str) -> None:
        try:
            await self.service_role_gateway.delete_auth_user(auth_user_id)
        except Exception:
            # Keep the original provisioning error visible to the caller.
            return
