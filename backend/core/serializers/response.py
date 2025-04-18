from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

class ErrorDetailSerializer(serializers.Serializer):
    message = serializers.CharField()
    code = serializers.CharField()

class SuccessResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    data = serializers.JSONField()
    error = serializers.SerializerMethodField()

    @extend_schema_field(ErrorDetailSerializer(allow_null=True))
    def get_error(self, obj):
        return None

class ErrorResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=False)
    data = serializers.SerializerMethodField()
    error = ErrorDetailSerializer()

    @extend_schema_field(serializers.JSONField(allow_null=True))
    def get_data(self, obj):
        return None