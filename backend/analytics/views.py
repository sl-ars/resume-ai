from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from analytics.models import LogEntry
from analytics.serializers import LogEntrySerializer
from core.permissions import IsLogOwnerOrAdmin
from core.mixins.response import BaseResponseMixin
from core.serializers.response import SuccessResponseSerializer, ErrorResponseSerializer

common_tags = ['Logs']


@extend_schema_view(
    list=extend_schema(
        tags=common_tags,
        responses={
            200: SuccessResponseSerializer,
            400: ErrorResponseSerializer,
            401: ErrorResponseSerializer,
            403: ErrorResponseSerializer,
            404: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        }
    ),
    retrieve=extend_schema(
        tags=common_tags,
        parameters=[
            OpenApiParameter(name='id', type=OpenApiTypes.UUID, location=OpenApiParameter.PATH),
        ],
        responses={
            200: SuccessResponseSerializer,
            400: ErrorResponseSerializer,
            401: ErrorResponseSerializer,
            403: ErrorResponseSerializer,
            404: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
        }
    )
)
class LogEntryViewSet(BaseResponseMixin, viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving user log entries.

    - List all logs: GET /api/logs/
    - Retrieve single log: GET /api/logs/{id}/
    """
    serializer_class = LogEntrySerializer
    permission_classes = [permissions.IsAuthenticated, IsLogOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return LogEntry.objects.all()
        return LogEntry.objects.filter(user_id=user.id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return self.success(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.success(serializer.data)