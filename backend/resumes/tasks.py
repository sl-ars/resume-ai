"""
Celery tasks for background processing of resume operations.
"""

import logging
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings

from resumes.models import Resume
from resumes.services.parser import ResumeParserService
from resumes.services.analyzer import ResumeAnalysisService


logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_backoff_max=600,
    retry_kwargs={'max_retries': 3},
    name='resumes.tasks.process_resume'
)
def process_resume(self, resume_id):
    """
    Process a resume by first parsing it and then analyzing it.
    This is the main task that should be called after a resume is uploaded.
    
    Args:
        resume_id (str): The UUID of the resume to process
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info(f"Starting processing for resume {resume_id}")
        
        # First parse the resume text directly using the service
        logger.info(f"Directly parsing resume {resume_id}")
        parse_result = ResumeParserService.parse_resume(resume_id)
        if not parse_result:
            logger.error(f"Failed to parse resume {resume_id}")
            return False
            
        # Then analyze the resume
        logger.info(f"Analyzing resume {resume_id} after successful parsing")
        analyze_result = ResumeAnalysisService.analyze_resume(resume_id)
        if not analyze_result:
            logger.error(f"Failed to analyze resume {resume_id}")
            return False
            
        logger.info(f"Successfully processed resume {resume_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error processing resume {resume_id}: {e}")
        try:
            Resume.objects.filter(id=resume_id).update(status=Resume.Status.FAILED)
        except Exception:
            pass
        
        # Retry with exponential backoff
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_backoff_max=300,
    retry_kwargs={'max_retries': 3},
    name='resumes.tasks.parse_resume'
)
def parse_resume(self, resume_id):
    """
    Parse the content of a resume.
    
    Args:
        resume_id (str): The UUID of the resume to parse
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info(f"Parsing resume {resume_id}")
        result = ResumeParserService.parse_resume(resume_id)
        return result is not None
    except Exception as e:
        logger.error(f"Error parsing resume {resume_id}: {e}")
        try:
            # Update status to failed
            Resume.objects.filter(id=resume_id).update(status=Resume.Status.FAILED)
        except Exception:
            pass
        
        # Retry with exponential backoff
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=5,
    retry_backoff_max=300,
    retry_kwargs={'max_retries': 3},
    name='resumes.tasks.analyze_resume'
)
def analyze_resume(self, resume_id):
    """
    Analyze the content of a parsed resume.
    
    Args:
        resume_id (str): The UUID of the resume to analyze
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info(f"Analyzing resume {resume_id}")
        result = ResumeAnalysisService.analyze_resume(resume_id)
        return result is not None
    except Exception as e:
        logger.error(f"Error analyzing resume {resume_id}: {e}")
        
        # Retry with exponential backoff
        raise self.retry(exc=e) 