from rest_framework import generics, permissions, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from resumes.models import Resume
from resumes.serializers import (
    ResumeUploadSerializer,
    ResumeListSerializer,
    ResumeDetailSerializer,
    ResumeContentSerializer,
    ResumeActionResponseSerializer,
)
from resumes.mongo.storage import get_resume_content_by_resume_id, get_resume_analysis_by_resume_id
from resumes.services.analyzer import ResumeAnalysisService
from resumes.tasks import process_resume
from core.permissions import IsResumeOwnerOrRecruiterOrAdmin
from core.serializers.response import SuccessResponseSerializer, ErrorResponseSerializer

common_tags = ['Resumes']


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Resume.objects.all()
        if user.is_recruiter:
            return Resume.objects.filter(visibility=Resume.Visibility.PUBLIC)
        return Resume.objects.filter(user=user)


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ResumeDetailView(generics.RetrieveUpdateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrRecruiterOrAdmin]
    lookup_field = 'id'
    lookup_url_kwarg = 'resume_id'


@extend_schema(
    tags=common_tags,
    request=ResumeUploadSerializer,
    responses={
        201: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ResumeUploadView(generics.CreateAPIView):
    serializer_class = ResumeUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.is_recruiter:
            return Response({"detail": "Recruiters cannot upload resumes."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        title = serializer.validated_data['title']
        visibility = serializer.validated_data.get('visibility', Resume.Visibility.PRIVATE)

        extension = file.name.split('.')[-1].lower()
        if extension not in ['pdf', 'docx']:
            return Response({"detail": "Unsupported file type. Only PDF and DOCX allowed."},
                            status=status.HTTP_400_BAD_REQUEST)

        resume = Resume.objects.create(
            user=request.user,
            title=title,
            file=file,
            file_type=extension,
            original_filename=file.name,
            visibility=visibility,
            status=Resume.Status.PROCESSING,
        )

        process_resume(str(resume.id))

        return Response(
            {"resume_id": str(resume.id), "detail": "Resume uploaded and processing started."},
            status=status.HTTP_201_CREATED
        )


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ResumeContentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrRecruiterOrAdmin]

    def get(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            content_doc = get_resume_content_by_resume_id(str(resume.id))
            if not content_doc:
                return Response({"detail": "Parsed resume content not available."}, status=status.HTTP_404_NOT_FOUND)

            serializer = ResumeContentSerializer(content_doc)
            return Response(serializer.data)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=common_tags,
    responses={
        200: SuccessResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        404: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    }
)
class ResumeAnalysisView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrRecruiterOrAdmin]

    def get(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            analysis_doc = get_resume_analysis_by_resume_id(str(resume.id))
            if not analysis_doc:
                return Response({"detail": "Resume analysis not found."}, status=status.HTTP_404_NOT_FOUND)

            return Response(analysis_doc)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            ResumeAnalysisService.analyze_resume(resume_id)

            return Response({"detail": "Resume analysis started."})
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)