"""
Service for parsing uploaded resumes and storing the parsed content.
"""

import io
import logging
from typing import Optional

import docx2txt

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

from resumes.models import Resume
from resumes.mongo.storage import insert_resume_content
from resumes.schemas.resume import ResumeContent
from analytics.utils import log_action
from analytics.models import LogEntry

logger = logging.getLogger(__name__)


class ResumeParserService:
    """
    Service for extracting text content from resume files and saving parsed data.
    """

    @staticmethod
    def extract_text_from_pdf(file) -> str:
        if PyPDF2 is None:
            raise ImportError("PyPDF2 must be installed to parse PDF files.")

        pdf_text = ""
        try:
            file_obj = io.BytesIO(file.read())
            file.seek(0)

            reader = PyPDF2.PdfReader(file_obj)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pdf_text += text
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise ValueError("Unable to parse PDF file.")

        return pdf_text.strip()

    @staticmethod
    def extract_text_from_docx(file) -> str:
        try:
            file_obj = io.BytesIO(file.read())
            file.seek(0)
            text = docx2txt.process(file_obj)
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
            raise ValueError("Unable to parse DOCX file.")

    @classmethod
    def extract_text(cls, resume: Resume) -> str:
        if resume.file_type.lower() == 'pdf':
            return cls.extract_text_from_pdf(resume.file)
        elif resume.file_type.lower() == 'docx':
            return cls.extract_text_from_docx(resume.file)
        else:
            raise ValueError(f"Unsupported file type: {resume.file_type}")

    @classmethod
    def parse_resume(cls, resume_id: str) -> Optional[str]:
        """
        Parse resume file, extract text, save it to MongoDB, and log the operation.
        """
        try:
            resume = Resume.objects.get(id=resume_id)

            # Update status to processing
            resume.status = Resume.Status.PROCESSING
            resume.save()

            text = cls.extract_text(resume)

            logger.info(f"Parsing resume {resume_id}")
            # Save parsed content to MongoDB
            content = ResumeContent(
                resume_id=resume.id,  # This is a UUID object
                user_id=resume.user.id,  # This is an integer
                raw_text=text,
                full_name=None,
                email=None,
                phone=None,
                location=None,
                linkedin_url=None,
                summary=None,
            )

            logger.info(f"Inserting content of resume {resume_id}")
            insert_resume_content(content.dict())

            # Update status to completed
            resume.status = Resume.Status.COMPLETED
            resume.save()

            # Log successful parse
            log_action(
                user=resume.user,
                object_type='resume',
                object_id=resume.id,
                action=LogEntry.ActionType.PARSE,
                message="Resume parsed successfully."
            )

            return str(resume.id)

        except Resume.DoesNotExist as e:
            logger.error(f"Resume with id {resume_id} not found: {repr(e)}")
            return None

        except Exception as e:
            logger.error(f"Failed to parse resume {resume_id}: {e}")

            Resume.objects.filter(id=resume_id).update(status=Resume.Status.FAILED)

            if resume := Resume.objects.filter(id=resume_id).first():
                log_action(
                    user=resume.user,
                    object_type='resume',
                    object_id=resume.id,
                    action=LogEntry.ActionType.ERROR,
                    message=f"Failed to parse resume: {str(e)}"
                )

            return None