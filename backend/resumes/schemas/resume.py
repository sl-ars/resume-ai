from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import List, Optional
from uuid import UUID

class ResumeContent(BaseModel):
    """
    Parsed content extracted from the uploaded resume.
    """
    resume_id: UUID
    user_id: Optional[int] = None
    raw_text: Optional[str] = None

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None
    summary: Optional[str] = None

    class Config:
        orm_mode = True

class SkillItem(BaseModel):
    name: str
    confidence_score: float

class ResumeAnalysis(BaseModel):
    """
    AI analysis results of the resume.
    """
    resume_id: UUID
    user_id: Optional[int] = None

    overall_score: float
    content_score: float
    formatting_score: float
    ats_compatibility_score: float

    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]

    class Config:
        orm_mode = True