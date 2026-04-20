from fastapi import APIRouter, Depends, status

from app.schemas.auth import PatientSignupRequest, PatientSignupResponse
from app.services.dependencies import get_signup_service
from app.services.signup_service import SignupService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup/patient",
    response_model=PatientSignupResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup_patient(
    payload: PatientSignupRequest,
    signup_service: SignupService = Depends(get_signup_service),
) -> PatientSignupResponse:
    return await signup_service.signup_patient(payload)
