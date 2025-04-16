from rest_framework import serializers
from jobs.models import Job, Application


class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for job listings.
    """

    class Meta:
        model = Job
        fields = [
            'id',
            'user',
            'title',
            'description',
            'skills_required',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for job applications.
    """

    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    resume_title = serializers.CharField(source='resume.title', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'applicant_email',
            'resume_title',
            'job_title',
            'created_at',
            'is_approved'
        ]
        read_only_fields = fields