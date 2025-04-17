from rest_framework import serializers
from jobs.models import Job, Application
from companies.models import Company
from resumes.serializers import ResumeSerializer

class CompanySerializer(serializers.ModelSerializer):
    """
    Full serializer for company information.
    """

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'description',
            'website',
            'logo',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for job listings with full company details.
    """

    company = CompanySerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'company',
            'title',
            'description',
            'skills_required',
            'location',
            'is_remote',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for job applications with full job and company information.
    """

    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    resume = ResumeSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'applicant_email',
            'resume',
            'job',
            'is_approved',
            'created_at',
        ]
        read_only_fields = fields


class ApplicationShortSerializer(serializers.ModelSerializer):
    """
    Short serializer for applications inside job detail.
    """
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    resume_title = serializers.CharField(source='resume.title', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'applicant_email',
            'resume_title',
            'is_approved',
            'created_at',
        ]
        read_only_fields = fields


class JobDetailSerializer(serializers.ModelSerializer):
    """
    Full Job detail including company and related applications.
    """
    company = CompanySerializer(read_only=True)
    applications = ApplicationShortSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'company',
            'title',
            'description',
            'skills_required',
            'location',
            'is_remote',
            'status',
            'applications',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class ResumeMatchRequestSerializer(serializers.Serializer):
    resume_id = serializers.UUIDField()