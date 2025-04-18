from rest_framework import serializers
from analytics.models import LogEntry


class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = [
            'id',
            'timestamp',
            'user_id',
            'object_type',
            'object_id',
            'action',
            'message',
        ]