"""
Custom permissions for the resumes app.
"""

from rest_framework import permissions
from django.shortcuts import get_object_or_404
from resumes.models import Resume


class IsResumeOwner(permissions.BasePermission):
    """
    Permission check for resume ownership.
    Allow only if the user is the owner of the resume.
    """
    
    def has_object_permission(self, request, view, obj):
        # Resume owner can always access their own resume
        return obj.user == request.user


class IsAdminUser(permissions.BasePermission):
    """
    Permission check for admin users.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsResumeOwnerOrEmployerOrAdmin(permissions.BasePermission):
    """
    Allow access if:
    1. User is the owner of the resume
    2. User is an employer and can view specific resume based on job applications or public visibility
    3. User is an admin
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Admin can access everything
        if request.user.is_admin:
            return True
            
        # For detail view, we'll check in has_object_permission
        if 'resume_id' not in view.kwargs:
            # Only return user's own resumes if not admin or employer
            if not (request.user.is_admin or request.user.is_recruiter):
                return True  # Will be filtered in the view
            return True
            
        return True
    
    def has_object_permission(self, request, view, obj):
        # Resume owner can always access their own resume
        if obj.user == request.user:
            return True
            
        # Admin can access any resume
        if request.user.is_admin:
            return True
            
        # Employer can access resumes if student has applied to jobs
        # or made resume public (this would need to be added to the model)
        if request.user.is_recruiter:
            # TODO: Add check for job applications here when job model is implemented
            # This is a placeholder assuming there's a model for job applications
            # If the student applied to any job posted by this employer
            # For now just return False
            return False
            
        # Otherwise deny access
        return False


class InternalAPIOnlyPermission(permissions.BasePermission):
    """
    Permission for internal API endpoints that should not be publicly accessible.
    """
    
    def has_permission(self, request, view):
        # Check if request is from an internal source
        # This could be enhanced with proper authentication mechanisms
        # For this example, only allow superusers
        return request.user.is_authenticated and request.user.is_superuser 