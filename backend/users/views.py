from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from users.models import User, Profile
from users.serializers import (
    UserSerializer,
    RegisterSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    ProfileSerializer,
    CustomTokenObtainPairSerializer, ResendVerificationEmailSerializer,
)
from users.services import PasswordResetService, EmailVerificationService
from core.mixins.response import BaseResponseMixin
from core.serializers.response import SuccessResponseSerializer, ErrorResponseSerializer
from rest_framework.exceptions import MethodNotAllowed

common_responses = {
    200: SuccessResponseSerializer,
    201: SuccessResponseSerializer,
    400: ErrorResponseSerializer,
    401: ErrorResponseSerializer,
    403: ErrorResponseSerializer,
    404: ErrorResponseSerializer,
    500: ErrorResponseSerializer,
}


@extend_schema(tags=["Auth"])
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(tags=["Auth"])
class CustomTokenRefreshView(TokenRefreshView):
    pass


@extend_schema(tags=["Auth"])
class CustomTokenVerifyView(TokenVerifyView):
    pass


@extend_schema(tags=["Users"])
class UserViewSet(BaseResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet for user registration, email verification and password reset.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'verify_email', 'request_email_verification', 'request_password_reset', 'reset_password', 'resend_verification_email']:
            return [permissions.AllowAny()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        return super().get_serializer_class()


    def create(self, request, *args, **kwargs):
        """
        Disable the default create method. Registration handled via /auth/register/.
        """
        raise MethodNotAllowed("POST")

    @extend_schema(
        request=RegisterSerializer,
        responses={**common_responses, 201: SuccessResponseSerializer},
        description="Register a new user account."
    )
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request, *args, **kwargs):  # <-- не create!
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        EmailVerificationService.send_verification_email(user)

        return self.success({
            "user": UserSerializer(user).data,
            "message": "User registered successfully. Please verify your email."
        }, status_code=status.HTTP_201_CREATED)


    @extend_schema(
        request=EmailVerificationSerializer,
        responses=common_responses,
        description="Verify email address using uid and token."
    )
    @action(detail=False, methods=['post'], url_path='verify-email')
    def verify_email(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']

        user = EmailVerificationService.verify_token(uid, token)
        if user:
            user.is_email_verified = True
            user.save()
            return self.success({"message": "Email verified successfully."})

        return self.error("Invalid or expired verification token.")

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses=common_responses,
        description="Request password reset email."
    )
    @action(detail=False, methods=['post'], url_path='request-password-reset')
    def request_password_reset(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            PasswordResetService.send_password_reset_email(user)
            return self.success({"message": "Password reset email sent."})
        except User.DoesNotExist:
            return self.error("User not found.")

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses=common_responses,
        description="Confirm new password after reset."
    )
    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        user = PasswordResetService.verify_token(uid, token)
        if user:
            user.set_password(password)
            user.save()
            return self.success({"message": "Password reset successful."})

        return self.error("Invalid or expired reset token.")

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses=common_responses,
        description="Request email verification link again."
    )
    @action(detail=False, methods=['post'], url_path='request-email-verification')
    def request_email_verification(self, request):
        """
        Request sending email verification link again to the user.
        """
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            if user.is_email_verified:
                return self.error("Email already verified.", status.HTTP_400_BAD_REQUEST)

            EmailVerificationService.send_verification_email(user)
            return self.success({"message": "Verification email sent."})
        except User.DoesNotExist:
            return self.error("User not found.")

    @extend_schema(
        responses=common_responses,
        description="Resend email verification link."
    )
    @action(detail=False, methods=['post'], url_path='resend-verification-email')
    def resend_verification_email(self, request, *args, **kwargs):

        try:
            user = request.user


            if user.is_email_verified:
                return self.success(
                    {"message": "Your email is already verified."}
                )

            EmailVerificationService.send_verification_email(user)



            return self.success({"message": "Verification email sent."}


            )
        except User.DoesNotExist:
            return self.error(
                {"message": "User with this email does not exist."},
            status.HTTP_404_NOT_FOUND
            )


common_responses = {
    200: SuccessResponseSerializer,
    201: SuccessResponseSerializer,
    400: ErrorResponseSerializer,
    401: ErrorResponseSerializer,
    403: ErrorResponseSerializer,
    404: ErrorResponseSerializer,
    500: ErrorResponseSerializer,
}


@extend_schema(tags=["Profiles"])
class ProfileViewSet(BaseResponseMixin, viewsets.ViewSet):
    """
    ViewSet for managing authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

    @extend_schema(
        responses={**common_responses, 200: ProfileSerializer},
        description="Retrieve the current authenticated user's profile."
    )
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Get the current authenticated user's profile.
        """
        profile = self.get_object()
        serializer = ProfileSerializer(profile)
        return self.success(serializer.data)

    @extend_schema(
        request=ProfileSerializer,
        responses={**common_responses, 200: ProfileSerializer},
        description="Update the current authenticated user's profile."
    )
    @action(detail=False, methods=['put', 'patch'], url_path='update-me')
    def update_me(self, request):
        """
        Update the current authenticated user's profile.
        """
        profile = self.get_object()
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.success(serializer.data)


