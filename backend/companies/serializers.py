from rest_framework import serializers
from companies.models import Company
from users.serializers import UserSerializer

class CompanySerializer(serializers.ModelSerializer):
    recruiters = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'description',
            'website',
            'logo',
            'recruiters',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'name',
            'description',
            'website',
            'logo',
        ]