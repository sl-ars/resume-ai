from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView, UserViewSet

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Authentication
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', UserViewSet.as_view({'post': 'create'}), name='register'),
    path('api/auth/verify-email/', UserViewSet.as_view({'post': 'verify_email'}), name='verify_email'),
    path('api/auth/request-password-reset/', UserViewSet.as_view({'post': 'request_password_reset'}), name='request_password_reset'),
    path('api/auth/reset-password/', UserViewSet.as_view({'post': 'reset_password'}), name='reset_password'),

    # Application endpoints
    path('api/', include('users.urls')),
    path('api/', include('resumes.urls')),
    #path('api/', include('jobs.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)