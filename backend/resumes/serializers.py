from rest_framework import serializers
from resumes.models import Resume

class ResumeListSerializer(serializers.ModelSerializer):
    overall_score = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'title', 'file_type', 'status', 'visibility', 'created_at', 'updated_at', 'overall_score']

    def get_overall_score(self, obj) -> float | None:
        from resumes.mongo.storage import get_resume_analysis_by_resume_id
        analysis = get_resume_analysis_by_resume_id(str(obj.id))
        if analysis:
            return analysis.get('overall_score')
        return None

class ResumeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file_type', 'status', 'visibility', 'original_filename', 'created_at', 'updated_at']
        read_only_fields = ['id', 'file_type', 'status', 'original_filename', 'created_at', 'updated_at']

class ResumeUploadSerializer(serializers.Serializer):
    """
    Serializer for uploading a resume (PDF or DOCX).
    """
    title = serializers.CharField(max_length=255)
    file = serializers.FileField()
    visibility = serializers.ChoiceField(
        choices=Resume.Visibility.choices,
        default=Resume.Visibility.PRIVATE
    )


class ResumeActionResponseSerializer(serializers.Serializer):
    """
    Standard response for resume actions (upload, parse, analyze).
    """
    detail = serializers.CharField()


class ResumeContentSerializer(serializers.Serializer):
    """
    Serializer for parsed resume content (coming from MongoDB).
    """
    full_name = serializers.CharField(allow_blank=True, required=False)
    email = serializers.EmailField(allow_blank=True, required=False)
    phone = serializers.CharField(allow_blank=True, required=False)
    location = serializers.CharField(allow_blank=True, required=False)
    linkedin_url = serializers.URLField(allow_blank=True, required=False)
    summary = serializers.CharField(allow_blank=True, required=False)
    raw_text = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class ResumeSerializer(serializers.ModelSerializer):
    """
    Full serializer for Resume (used for creation and update).
    """

    class Meta:
        model = Resume
        fields = [
            'id', 'title', 'file', 'file_type', 'status',
            'visibility', 'original_filename', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_type', 'status', 'original_filename', 'created_at', 'updated_at']