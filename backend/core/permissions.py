"""
Centralized permissions for the application.
"""

from rest_framework import permissions

from jobs.models import Job, Application
from resumes.models import Resume
from analytics.models import LogEntry


class IsAdminUser(permissions.BasePermission):
    """
    Allow access only to admin users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_admin
        )


class IsResumeOwner(permissions.BasePermission):
    """
    Allow access only if the user owns the resume.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Resume):
            return obj.user == request.user
        return False


class IsLogOwner(permissions.BasePermission):
    """
    Allow access only if the user owns the log entry (user associated with the log).
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, LogEntry):
            return obj.user == request.user
        return False


class IsResumeOwnerOrRecruiterOrAdmin(permissions.BasePermission):
    """
    Allow access if:
    - The user owns the resume (job seeker)
    - OR the user is an admin
    - OR the user is a recruiter AND has a relation through applications
    """

    def has_object_permission(self, request, view, obj: Resume):
        user = request.user

        if user.is_authenticated:
            if user.is_admin:
                return True

            if obj.user == user:
                return True

            if user.is_recruiter:
                if obj.visibility == Resume.Visibility.PUBLIC:
                    return True

                return self.has_application_between(user, obj)

        return False

    def has_application_between(self, recruiter, resume):
        """
        Check if a resume owner (job seeker) applied to any jobs of recruiter's companies
        """
        # Get all companies where recruiter works
        companies = recruiter.companies.all()

        if not companies.exists():
            return False

        # Get all jobs in these companies
        jobs = Job.objects.filter(company__in=companies)

        if not jobs.exists():
            return False

        # Check if resume owner applied to any of these jobs
        return Application.objects.filter(
            job__in=jobs,
            resume=resume
        ).exists()


class IsLogOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access if:
    - The user is the owner of the log entry
    - The user is an admin
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not isinstance(obj, LogEntry):
            return False

        # Owner
        if obj.user == user:
            return True

        # Admin
        if user.is_admin:
            return True

        return False


class InternalAPIOnlyPermission(permissions.BasePermission):
    """
    Allow access only for internal system users (superusers).
    """

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_superuser
        )



