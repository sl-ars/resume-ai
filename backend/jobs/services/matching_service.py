import nltk
from nltk.tokenize import word_tokenize

class MatchingService:
    """
    Service to match a resume text against job skills using NLTK.
    """

    @staticmethod
    def extract_skills(text: str) -> set:
        tokens = word_tokenize(text.lower())
        return set(tokens)

    @staticmethod
    def match_resume_to_job(resume_text: str, job_skills: list) -> float:
        resume_skills = MatchingService.extract_skills(resume_text)
        job_skills_set = set(skill.lower() for skill in job_skills)

        matches = resume_skills & job_skills_set
        if not job_skills_set:
            return 0.0
        return round(len(matches) / len(job_skills_set) * 100, 2)