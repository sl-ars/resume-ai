from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema, OpenApiRequest

from jobs.models import Job, Application
from resumes.models import Resume
from resumes.mongo.storage import get_resume_content_by_resume_id
from jobs.serializers import JobSerializer, ApplicationSerializer
from jobs.services.matching_service import MatchingService

from core.mixins.response import BaseResponseMixin
from core.serializers.response import SuccessResponseSerializer, ErrorResponseSerializer

from uuid import UUID

common_tags = ['Jobs']


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        201: SuccessResponseSerializer,
        204: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class JobViewSet(BaseResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing job postings.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobSerializer
    queryset = Job.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Job.objects.all()
        elif user.is_recruiter:
            return Job.objects.filter(user=user)
        return Job.objects.filter(status=Job.Status.APPROVED)

    def perform_create(self, serializer):
        if not self.request.user.is_recruiter:
            raise PermissionDenied("Only recruiters can create jobs.")
        serializer.save(user=self.request.user, status=Job.Status.PENDING_APPROVAL)

    @extend_schema(
        request=None,
        responses={200: SuccessResponseSerializer, 403: ErrorResponseSerializer},
        description="Admin approves a job posting."
    )
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_job(self, request, pk=None):
        if not request.user.is_admin:
            return self.error("Only admins can approve jobs.", status.HTTP_403_FORBIDDEN)

        job = self.get_object()
        job.status = Job.Status.APPROVED
        job.save()
        return self.success({"detail": "Job approved successfully."})

    @extend_schema(
        responses={200: ApplicationSerializer(many=True), 403: ErrorResponseSerializer},
        description="List all applications for a specific job (only recruiter or admin)."
    )
    @action(detail=True, methods=['get'], url_path='applications')
    def list_applications(self, request, pk=None):
        job = self.get_object()
        if request.user != job.user and not request.user.is_admin:
            return self.error("Permission denied.", status.HTTP_403_FORBIDDEN)

        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return self.success(serializer.data)

    @extend_schema(
        request=OpenApiRequest({
            "application/json": {
                "type": "object",
                "properties": {
                    "resume_id": {"type": "string", "format": "uuid"}
                },
                "required": ["resume_id"]
            }
        }),
        responses={201: SuccessResponseSerializer, 400: ErrorResponseSerializer, 403: ErrorResponseSerializer},
        description="Job seeker applies to a job."
    )
    @action(detail=True, methods=['post'], url_path='apply')
    def apply_to_job(self, request, pk=None):
        if not request.user.is_job_seeker:
            return self.error("Only job seekers can apply.", status.HTTP_403_FORBIDDEN)

        job = self.get_object()
        resume_id = request.data.get('resume_id')

        try:
            resume_id = str(UUID(resume_id))
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except (ValueError, Resume.DoesNotExist):
            return self.error("Invalid resume or resume not found.", status.HTTP_400_BAD_REQUEST)

        if Application.objects.filter(applicant=request.user, job=job).exists():
            return self.error("Already applied to this job.", status.HTTP_400_BAD_REQUEST)

        Application.objects.create(applicant=request.user, job=job, resume=resume)
        return self.success({"detail": "Application submitted."}, status.HTTP_201_CREATED)

    @extend_schema(
        request=OpenApiRequest({
            "application/json": {
                "type": "object",
                "properties": {
                    "resume_id": {"type": "string", "format": "uuid"}
                },
                "required": ["resume_id"]
            }
        }),
        responses={200: SuccessResponseSerializer, 400: ErrorResponseSerializer, 403: ErrorResponseSerializer, 404: ErrorResponseSerializer},
        description="Recruiter or admin matches a resume to a job."
    )
    @action(detail=True, methods=['post'], url_path='match')
    def match_resume(self, request, pk=None):
        if not (request.user.is_recruiter or request.user.is_admin):
            return self.error("Only recruiters/admins can match resumes.", status.HTTP_403_FORBIDDEN)

        job = self.get_object()
        resume_id = request.data.get('resume_id')

        try:
            resume_id = str(UUID(resume_id))
            resume_doc = get_resume_content_by_resume_id(resume_id)
        except ValueError:
            return self.error("Invalid resume_id format.", status.HTTP_400_BAD_REQUEST)

        if not resume_doc:
            return self.error("Resume not found or not parsed yet.", status.HTTP_404_NOT_FOUND)

        raw_text = resume_doc.get('raw_text', '')
        score = MatchingService.match_resume_to_job(raw_text, job.skills_required)

        return self.success({
            'job_id': str(job.id),
            'resume_id': resume_id,
            'match_score': round(score, 2)
        })

    @extend_schema(
        request=None,
        responses={200: SuccessResponseSerializer, 404: ErrorResponseSerializer},
        description="Job seeker matches their latest resume to a job."
    )
    @action(detail=True, methods=['post'], url_path='self-match')
    def self_match_job(self, request, pk=None):
        if not request.user.is_job_seeker:
            return self.error("Only job seekers can self-match.", status.HTTP_403_FORBIDDEN)

        job = self.get_object()
        resume = Resume.objects.filter(user=request.user).order_by('-created_at').first()

        if not resume:
            return self.error("No resume found.", status.HTTP_404_NOT_FOUND)

        resume_doc = get_resume_content_by_resume_id(str(resume.id))
        if not resume_doc:
            return self.error("Resume content not found.", status.HTTP_404_NOT_FOUND)

        raw_text = resume_doc.get('raw_text', '')
        score = MatchingService.match_resume_to_job(raw_text, job.skills_required)

        return self.success({
            'job_id': str(job.id),
            'resume_id': str(resume.id),
            'match_score': round(score, 2)
        })


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        201: SuccessResponseSerializer,
        204: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ApplicationViewSet(BaseResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing job applications.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Application.objects.all()
        elif user.is_recruiter:
            return Application.objects.filter(job__user=user)
        return Application.objects.filter(applicant=user)

    @extend_schema(
        request=None,
        responses={200: SuccessResponseSerializer, 403: ErrorResponseSerializer},
        description="Recruiter/Admin approves an application."
    )
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_application(self, request, pk=None):
        application = self.get_object()

        if request.user != application.job.user and not request.user.is_admin:
            return self.error("Permission denied.", status.HTTP_403_FORBIDDEN)

        application.is_approved = True
        application.save()
        return self.success({"detail": "Application approved."})

    @extend_schema(
        request=None,
        responses={200: SuccessResponseSerializer, 403: ErrorResponseSerializer},
        description="Recruiter/Admin rejects and deletes an application."
    )
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object()

        if request.user != application.job.user and not request.user.is_admin:
            return self.error("Permission denied.", status.HTTP_403_FORBIDDEN)

        application.delete()
        return self.success({"detail": "Application rejected and deleted."})