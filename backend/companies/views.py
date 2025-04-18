from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema_view, extend_schema

from companies.models import Company
from companies.serializers import CompanySerializer, CompanyCreateSerializer

common_tags = ['Companies']

@extend_schema_view(
    list=extend_schema(tags=common_tags),
    retrieve=extend_schema(tags=common_tags),
    create=extend_schema(tags=common_tags),
    update=extend_schema(tags=common_tags),
    partial_update=extend_schema(tags=common_tags),
    destroy=extend_schema(tags=common_tags),
    my_company=extend_schema(
        tags=common_tags
    ),
    add_recruiter=extend_schema(
        tags=common_tags
    ),
)
class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoint to manage companies.
    """
    queryset = Company.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateSerializer
        return CompanySerializer

    def perform_create(self, serializer):
        company = serializer.save()
        # Automatically add the creator as a recruiter
        company.recruiters.add(self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_recruiter(self, request, pk=None):
        """
        Add a recruiter to a company.
        """
        company = self.get_object()
        recruiter = request.user
        company.recruiters.add(recruiter)
        return Response({'detail': 'Recruiter added successfully.'}, status=status.HTTP_200_OK)
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='my-company')
    def my_company(self, request):
        """
        Get the company associated with the authenticated recruiter.
        """
        if request.user.role != 'recruiter':
            return Response({'detail': 'Only recruiters can access this endpoint.'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get the first company the recruiter is associated with
            company = request.user.companies.first()
            
            if not company:
                return Response({'detail': 'No company found for this recruiter.'}, 
                                status=status.HTTP_404_NOT_FOUND)
                
            serializer = self.get_serializer(company)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)