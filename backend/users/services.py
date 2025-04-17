import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import User


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Token generator for email verification"""
    
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.is_email_verified}"


class PasswordResetService:
    """Service for password reset functionality"""
    
    token_generator = PasswordResetTokenGenerator()
    
    @classmethod
    def generate_token(cls, user):
        """Generate token for password reset"""
        return {
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': cls.token_generator.make_token(user)
        }
    
    @classmethod
    def verify_token(cls, uid, token):
        """Verify password reset token"""
        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
            if cls.token_generator.check_token(user, token):
                return user
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            pass
        return None
    
    @classmethod
    def send_password_reset_email(cls, user, request=None):
        """Send password reset email to user"""
        token_data = cls.generate_token(user)
        
        # Generate password reset link

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password/{token_data['uid']}/{token_data['token']}"
        
        # Send email
        subject = 'Reset Your Password'
        message = f'Please use the following link to reset your password: {reset_url}'
        html_message = f'<p>Please use the following link to reset your password:</p><p><a href="{reset_url}">Reset Password</a></p>'
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True


class EmailVerificationService:
    """Service for email verification functionality"""
    
    token_generator = EmailVerificationTokenGenerator()
    
    @classmethod
    def generate_token(cls, user):
        """Generate token for email verification"""
        return {
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': cls.token_generator.make_token(user)
        }
    
    @classmethod
    def verify_token(cls, uid, token):
        """Verify email verification token"""
        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
            if cls.token_generator.check_token(user, token):
                return user
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            pass
        return None
    
    @classmethod
    def send_verification_email(cls, user, request=None):
        """Send verification email to user"""
        token_data = cls.generate_token(user)
        
        # Generate verification link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        verification_url = f"{frontend_url}/verify-email/{token_data['uid']}/{token_data['token']}"
        
        # Send email
        subject = 'Verify Your Email Address'
        message = f'Please use the following link to verify your email: {verification_url}'
        html_message = f'<p>Please use the following link to verify your email:</p><p><a href="{verification_url}">Verify Email</a></p>'
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True 