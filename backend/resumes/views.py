from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema_view, extend_schema

from resumes.services.parser import ResumeParserService
from resumes.services.analyzer import ResumeAnalysisService
from resumes.models import Resume
from resumes.serializers import (
    ResumeUploadSerializer,
    ResumeContentSerializer,
    ResumeActionResponseSerializer, 
    ResumeListSerializer,
    ResumeDetailSerializer,
)
from resumes.mongo.storage import get_resume_content_by_resume_id
from resumes.permissions import (
    IsResumeOwnerOrEmployerOrAdmin,
    InternalAPIOnlyPermission,
    IsAdminUser,
)
from resumes.tasks import process_resume

common_tags = ['Resumes']


@extend_schema_view(
    get=extend_schema(
        tags=['Resumes'],
        responses={200: ResumeListSerializer(many=True)}
    )
)
class ResumeListView(APIView):
    """
    List all resumes accessible to the authenticated user based on their role.
    - Job seekers can only see their own resumes
    - Employers can see resumes of students who applied to their jobs or made resumes public
    - Admins can see all resumes
    """
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrEmployerOrAdmin]

    def get(self, request, *args, **kwargs):
        # If admin, get all resumes
        if request.user.is_admin:
            resumes = Resume.objects.all().order_by('-created_at')
        # If employer, get student resumes based on job applications (not implemented yet)
        # and public resumes
        elif request.user.is_recruiter:
            # For now, only return public resumes
            # This would be extended to include resumes from applicants
            resumes = Resume.objects.filter(visibility=Resume.Visibility.PUBLIC).order_by('-created_at')
        # Otherwise, only get the user's own resumes
        else:
            resumes = Resume.objects.filter(user=request.user).order_by('-created_at')
            
        serializer = ResumeListSerializer(resumes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        tags=['Resumes'],
        responses={200: ResumeDetailSerializer}
    ),
    patch=extend_schema(
        tags=['Resumes'],
        request=ResumeDetailSerializer,
        responses={200: ResumeDetailSerializer}
    )
)
class ResumeDetailView(APIView):
    """
    Retrieve or update a resume's details.
    """
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrEmployerOrAdmin]

    def get(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)
            serializer = ResumeDetailSerializer(resume)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)
            
            # Only resume owner can update it
            if resume.user != request.user:
                return Response({"detail": "You don't have permission to update this resume."}, 
                               status=status.HTTP_403_FORBIDDEN)
                
            serializer = ResumeDetailSerializer(resume, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    post=extend_schema(
        tags=common_tags,
        request=ResumeUploadSerializer,
        responses={201: ResumeActionResponseSerializer, 400: ResumeActionResponseSerializer},
    )
)
class ResumeUploadView(APIView):
    """
    Upload a new resume and automatically trigger the parsing and analysis process.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ResumeUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        title = serializer.validated_data['title']
        visibility = serializer.validated_data.get('visibility', Resume.Visibility.PRIVATE)

        extension = file.name.split('.')[-1].lower()
        if extension not in ['pdf', 'docx']:
            return Response({"detail": "Unsupported file type. Only PDF and DOCX are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        resume = Resume.objects.create(
            user=request.user,
            title=title,
            file=file,
            file_type=extension,
            original_filename=file.name,
            visibility=visibility,
            status=Resume.Status.PROCESSING  # Set status to processing immediately
        )

        try:
            # For debugging - run task synchronously
            process_resume(str(resume.id))
            # Comment this out when debugging is done:
            # process_resume.delay(str(resume.id))

            success_message = "Resume uploaded and processed successfully."
        except Exception as e:
            success_message = f"Resume uploaded but processing encountered an error: {str(e)}"

        return Response({
            "resume_id": str(resume.id),
            "detail": success_message
        }, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        tags=common_tags,
        responses={200: ResumeContentSerializer, 404: ResumeActionResponseSerializer},
    )
)
class ResumeContentView(APIView):
    """
    View the parsed content of a resume.
    Access control is based on user role and relationship to the resume.
    """
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrEmployerOrAdmin]

    def get(self, request, resume_id, *args, **kwargs):
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            content_doc = get_resume_content_by_resume_id(str(resume.id))
            if not content_doc:
                return Response({"detail": "Resume content not found or still processing."}, status=status.HTTP_404_NOT_FOUND)

            serializer = ResumeContentSerializer(content_doc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        tags=common_tags,
        responses={200: ResumeActionResponseSerializer, 404: ResumeActionResponseSerializer},
    ),
    post=extend_schema(
        tags=common_tags,
        responses={200: ResumeActionResponseSerializer, 400: ResumeActionResponseSerializer},
    )
)
class ResumeAnalysisView(APIView):
    """
    API endpoint for analyzing a resume (POST) and retrieving analysis results (GET).
    """
    permission_classes = [permissions.IsAuthenticated, IsResumeOwnerOrEmployerOrAdmin]

    def get(self, request, resume_id, *args, **kwargs):
        """
        Get the analysis result of the resume.
        """
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            from resumes.mongo.storage import get_resume_analysis_by_resume_id
            analysis_doc = get_resume_analysis_by_resume_id(str(resume.id))

            if not analysis_doc:
                return Response({"detail": "Resume analysis not found or still processing."}, status=status.HTTP_404_NOT_FOUND)

            return Response(analysis_doc, status=status.HTTP_200_OK)

        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, resume_id, *args, **kwargs):
        """
        Trigger analysis of the resume.
        """
        try:
            resume = Resume.objects.get(id=resume_id)
            self.check_object_permissions(request, resume)

            ResumeAnalysisService.analyze_resume(resume_id)

            return Response({"detail": "Resume analysis triggered successfully."}, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Failed to analyze resume: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)