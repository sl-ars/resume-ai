from rest_framework.response import Response
from rest_framework import status

class BaseResponseMixin:
    """
    Mixin providing helper methods for consistent API responses.
    """

    def success(self, data=None, status_code=status.HTTP_200_OK):
        return Response({
            "success": True,
            "data": data,
            "error": None
        }, status=status_code)

    def error(self, message, code="error", status_code=status.HTTP_400_BAD_REQUEST):
        return Response({
            "success": False,
            "data": None,
            "error": {
                "message": message,
                "code": code
            }
        }, status=status_code)