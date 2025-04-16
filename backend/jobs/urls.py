from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs.views import JobViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'job', JobViewSet, basename='job')
router.register(r'applications', ApplicationViewSet, basename='application')
urlpatterns = [
    path('', include(router.urls)),
]