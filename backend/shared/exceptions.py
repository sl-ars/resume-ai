from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException, ValidationError
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF to standardize error responses.
    Returns the response that will be rendered for any exception.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, it was an unexpected exception
    if response is None:
        if isinstance(exc, Http404):
            data = {
                'detail': 'Not found.'
            }
            response_code = status.HTTP_404_NOT_FOUND
        elif isinstance(exc, PermissionDenied):
            data = {
                'detail': 'Permission denied.'
            }
            response_code = status.HTTP_403_FORBIDDEN
        else:
            data = {
                'detail': str(exc) if str(exc) else 'A server error occurred.'
            }
            response_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            
        # Add error code if available
        if hasattr(exc, 'code'):
            data['code'] = exc.code
        
        # Import Response here to avoid circular import
        from rest_framework.response import Response
        response = Response(data, status=response_code)
    
    # Process validation errors specifically to provide better details
    if isinstance(exc, ValidationError):
        if isinstance(response.data, dict):
            # If it's a dictionary, we need to add some metadata
            for field, errors in response.data.items():
                # Add field name to error messages for clarity
                if isinstance(errors, list):
                    response.data[field] = [f"{error}" for error in errors]
    
    return response