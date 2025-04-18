"""
Centralized permissions for the application.
"""

from rest_framework import permissions
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
    - The user is the resume owner
    - The user is an admin
    - The user is a recruiter (view only public or permitted resumes)
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not isinstance(obj, Resume):
            return False

        # Owner
        if obj.user == user:
            return True

        # Admin
        if user.is_admin:
            return True

        # Recruiter (restricted logic)
        if user.is_recruiter:
            # Placeholder for public resumes or applied resumes logic
            # Example: return obj.is_public
            return False  # Default: Deny

        return False


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