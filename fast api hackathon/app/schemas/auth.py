from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator


class PatientSignupRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    blood_group: str = Field(min_length=1, max_length=4)
    dob: date
    emergency_contact: str | None = Field(default=None, max_length=120)
    allergies: list[str] = Field(default_factory=list)

    @field_validator("full_name", "blood_group", mode="before")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, value: str) -> str:
        normalized = value.strip().upper()
        allowed = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
        if normalized not in allowed:
            raise ValueError("Blood group must be one of A+, A-, B+, B-, AB+, AB-, O+, O-.")
        return normalized

    @field_validator("emergency_contact", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None

    @field_validator("allergies", mode="before")
    @classmethod
    def normalize_allergies(cls, value: list[str] | str | None) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            raw_items = value.split(",")
        else:
            raw_items = value
        return [str(item).strip() for item in raw_items if str(item).strip()]


class PatientSignupResponse(BaseModel):
    auth_user_id: str
    profile_id: str
    patient_id: str
    vital_id: str
    email: EmailStr
    full_name: str
    role: str = "patient"
