from django.db import models
import uuid

class LogEntry(models.Model):
    class ActionType(models.TextChoices):
        PARSE = 'parse', 'Resume parsed'
        ANALYZE = 'analyze', 'Resume analyzed'
        ERROR = 'error', 'Error occurred'
        UPLOAD = 'upload', 'Resume uploaded'
        REGISTER = 'register', 'User registered'
        APPLY = 'apply', 'Job application submitted'
        CREATE_JOB = 'create_job', 'Job created'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    user_id = models.IntegerField(null=True, blank=True)
    object_type = models.CharField(max_length=50)
    object_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=20, choices=ActionType.choices)
    message = models.TextField()

    class Meta:
        db_table = 'analytics_logentry'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} [{self.action}] - {self.object_type} ({self.object_id})"