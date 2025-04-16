from django.urls import path, include
from rest_framework.routers import DefaultRouter
from analytics.views import LogEntryViewSet

router = DefaultRouter()
router.register(r'logs', LogEntryViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
]