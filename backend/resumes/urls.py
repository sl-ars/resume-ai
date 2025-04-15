from django.urls import path

from resumes.views import (
    ResumeUploadView,
    ResumeContentView,
    ResumeAnalysisView,
    ResumeListView,
    ResumeDetailView,
)

app_name = "resumes"

urlpatterns = [
    path('resumes/', ResumeListView.as_view(), name='resume-list'),
    path('resumes/upload/', ResumeUploadView.as_view(), name='upload'),
    path('resumes/<uuid:resume_id>/', ResumeDetailView.as_view(), name='detail'),
    path('resumes/<uuid:resume_id>/content/', ResumeContentView.as_view(), name='content'),
    path('resumes/<uuid:resume_id>/analyze/', ResumeAnalysisView.as_view(), name='analyze'),
]