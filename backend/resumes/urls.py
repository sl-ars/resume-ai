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
    path('', ResumeListView.as_view(), name='resume-list'),
    path('upload/', ResumeUploadView.as_view(), name='upload'),
    path('<uuid:resume_id>/', ResumeDetailView.as_view(), name='detail'),
    path('<uuid:resume_id>/content/', ResumeContentView.as_view(), name='content'),
    path('<uuid:resume_id>/analyze/', ResumeAnalysisView.as_view(), name='analyze'),
]