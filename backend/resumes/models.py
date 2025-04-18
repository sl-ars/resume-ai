import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

def resume_file_path(instance, filename):
    return f"resumes/{instance.user.id}/{filename}"

class Resume(models.Model):
    """
    Basic information and file storage for uploaded resumes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
    
    class Visibility(models.TextChoices):
        PRIVATE = 'private', _('Private')
        PUBLIC = 'public', _('Public')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=resume_file_path)
    file_type = models.CharField(max_length=10)  # Example: pdf, docx
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE
    )
    original_filename = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.file and not self.original_filename:
            self.original_filename = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email}'s Resume - {self.title}"
        
    @property
    def is_public(self):
        return self.visibility == self.Visibility.PUBLIC