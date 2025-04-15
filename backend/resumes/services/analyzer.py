"""
Service for analyzing parsed resumes and storing analysis results.
"""

import logging
import re
from typing import List, Tuple, Optional
from uuid import UUID

from resumes.models import Resume
from resumes.mongo.storage import insert_resume_analysis, get_resume_content_by_resume_id
from resumes.schemas.resume import ResumeAnalysis
from analytics.utils import log_action
from analytics.models import LogEntry

logger = logging.getLogger(__name__)

def fix_resume_content_data(data: dict) -> dict:
    """
    Ensure correct types for resume content before parsing.
    """
    if "resume_id" in data and not isinstance(data["resume_id"], UUID):
        try:
            data["resume_id"] = UUID(data["resume_id"])
        except Exception:
            logger.error(f"Invalid resume_id format in data: {data.get('resume_id')}")
            raise ValueError("Invalid resume_id in resume content")

    if "user_id" in data and data["user_id"] is not None:
        data["user_id"] = int(data["user_id"])

    return data


class ResumeAnalysisService:
    """
    Service for analyzing resume content and generating feedback.
    """

    @staticmethod
    def analyze_content_quality(raw_text: str) -> Tuple[float, List[str], List[str]]:
        strengths = []
        weaknesses = []

        word_count = len(raw_text.split())

        if word_count >= 300:
            strengths.append("Resume has sufficient length.")
        else:
            weaknesses.append("Resume is too short. Aim for at least 300 words.")

        if "summary" in raw_text.lower() or "objective" in raw_text.lower():
            strengths.append("Resume includes a summary or objective section.")
        else:
            weaknesses.append("Consider adding a summary or objective section.")

        score = min(max(word_count / 1000 * 10, 2.0), 10.0)

        return score, strengths, weaknesses

    @staticmethod
    def analyze_formatting(raw_text: str) -> Tuple[float, List[str], List[str]]:
        strengths = []
        weaknesses = []

        lines = raw_text.splitlines()
        empty_lines = sum(1 for line in lines if not line.strip())

        if empty_lines > 5:
            strengths.append("Good use of whitespace for readability.")
        else:
            weaknesses.append("Consider adding more spacing for better readability.")

        bullet_points = sum(1 for line in lines if line.strip().startswith(('-', '•')))

        if bullet_points >= 5:
            strengths.append("Effective use of bullet points.")
        else:
            weaknesses.append("Use bullet points to structure content more clearly.")

        score = 5.0
        score += 2.0 if empty_lines > 5 else -1.0
        score += 2.0 if bullet_points >= 5 else -1.0

        return min(score, 10.0), strengths, weaknesses

    @staticmethod
    def analyze_ats_compatibility(raw_text: str) -> Tuple[float, List[str], List[str]]:
        strengths = []
        weaknesses = []

        if '\t' not in raw_text:
            strengths.append("No tables detected, good for ATS parsing.")
        else:
            weaknesses.append("Avoid using tables; they can confuse ATS.")

        sections = ["experience", "education", "skills", "projects"]
        detected_sections = [section for section in sections if re.search(rf'\b{section}\b', raw_text.lower())]

        if len(detected_sections) >= 3:
            strengths.append("Resume contains standard sections recognizable by ATS.")
        else:
            weaknesses.append("Include standard sections like Experience, Education, Skills.")

        score = 5.0
        score += 2.0 if '\t' not in raw_text else -2.0
        score += len(detected_sections)

        return min(score, 10.0), strengths, weaknesses

    @classmethod
    def analyze_resume(cls, resume_id: str) -> Optional[str]:
        """
        Perform complete analysis of a resume and save the results.
        """
        try:
            resume = Resume.objects.get(id=resume_id)

            content_doc = get_resume_content_by_resume_id(str(resume.id))
            if not content_doc:
                logger.error(f"No parsed content found for resume {resume_id}.")
                return None

            content_doc = fix_resume_content_data(content_doc)
            raw_text = content_doc.get('raw_text', '')

            content_score, content_strengths, content_weaknesses = cls.analyze_content_quality(raw_text)
            formatting_score, formatting_strengths, formatting_weaknesses = cls.analyze_formatting(raw_text)
            ats_score, ats_strengths, ats_weaknesses = cls.analyze_ats_compatibility(raw_text)

            overall_score = round((content_score * 0.4 + formatting_score * 0.3 + ats_score * 0.3), 2)

            strengths = content_strengths + formatting_strengths + ats_strengths
            weaknesses = content_weaknesses + formatting_weaknesses + ats_weaknesses

            improvement_suggestions = [f"Improve: {weak}" for weak in weaknesses[:5]]
            
            analysis = ResumeAnalysis(
                resume_id=resume.id,
                user_id=resume.user.id,  # Store user_id as integer
                overall_score=overall_score,
                content_score=content_score,
                formatting_score=formatting_score,
                ats_compatibility_score=ats_score,
                strengths=strengths,
                weaknesses=weaknesses,
                improvement_suggestions=improvement_suggestions,
            )
            insert_resume_analysis(analysis.dict())

            log_action(
                user=resume.user,
                object_type='resume',
                object_id=resume.id,
                action=LogEntry.ActionType.ANALYZE,
                message="Resume analyzed successfully."
            )

            return str(resume.id)

        except Resume.DoesNotExist:
            logger.error(f"Resume with id {resume_id} not found.")
            return None

        except Exception as e:
            logger.error(f"Failed to analyze resume {resume_id}: {e}")
            resume = Resume.objects.filter(id=resume_id).first()
            if resume:
                log_action(
                    user=resume.user,
                    object_type='resume',
                    object_id=resume.id,
                    action=LogEntry.ActionType.ERROR,
                    message=f"Failed to analyze resume: {str(e)}"
                )
            return None