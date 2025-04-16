from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Profile, User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user info and role in the response"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        # Add user info to token response
        data.update({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_email_verified': user.is_email_verified,
        })
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 
                 'is_email_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'is_email_verified', 'created_at', 'updated_at')


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password fields didn't match."})
        
        try:
            # Validate password strength
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm field
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create empty profile
        Profile.objects.create(user=user)
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        # Check if user exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is registered with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password fields didn't match."})
        
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    role = serializers.CharField(source='user.role', read_only=True)
    is_email_verified = serializers.BooleanField(source='user.is_email_verified',read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_email_verified',
                 'bio', 'location', 'phone_number', 'website', 
                 'linkedin_url', 'github_url', 'profile_picture')
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update user data
        user = instance.user
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        user.save()
        
        # Update profile data
        return super().update(instance, validated_data)

class ResendVerificationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()