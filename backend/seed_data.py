import os
import django
import random
import uuid

# Setup Django manually if running as standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resume_ai.settings')
django.setup()

from users.models import User, Profile
from companies.models import Company
from jobs.models import Job

# --- Settings ---
NUM_JOB_SEEKERS = 10
NUM_RECRUITERS = 5
NUM_ADMINS = 2
COMPANIES = [
    "Google",
    "Microsoft",
    "Amazon",
    "Netflix",
    "Tesla"
]
VACANCY_TITLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "QA Engineer",
    "UX/UI Designer",
    "Cloud Architect",
    "AI Researcher"
]
SKILLS = [
    "Python", "Django", "React", "AWS", "Docker",
    "Kubernetes", "PostgreSQL", "MongoDB", "Microservices", "GraphQL"
]

# --- Helpers ---
def create_user(email, role, password="password123"):
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=email.split('@')[0].capitalize(),
        last_name="Test",
        role=role,
        is_email_verified=True
    )
    Profile.objects.create(user=user)
    return user


User.objects.all().delete()
Profile.objects.all().delete()
Company.objects.all().delete()
Job.objects.all().delete()

# --- Create Users ---
print("Creating users...")
job_seekers = [
    create_user(f"user{i}@example.com", User.Role.JOB_SEEKER)
    for i in range(1, NUM_JOB_SEEKERS + 1)
]

recruiters = [
    create_user(f"recruiter{i}@example.com", User.Role.RECRUITER)
    for i in range(1, NUM_RECRUITERS + 1)
]

admins = [
    create_user(f"admin{i}@example.com", User.Role.ADMIN)
    for i in range(1, NUM_ADMINS + 1)
]

# --- Create Companies ---
print("Creating companies...")
companies = []
for i, company_name in enumerate(COMPANIES):
    company = Company.objects.create(
        name=company_name,
        description=f"{company_name} is a leading tech company.",
        website=f"https://{company_name.lower()}.com",
    )
    company.recruiters.add(recruiters[i % len(recruiters)])
    companies.append(company)

# --- Create Jobs ---
print("Creating jobs...")
for company in companies:
    for title in VACANCY_TITLES:
        job = Job.objects.create(
            company=company,
            title=title,
            description=f"Looking for a skilled {title}.",
            skills_required=random.sample(SKILLS, k=5),
            status=Job.Status.APPROVED,
        )

print("Done seeding database!")