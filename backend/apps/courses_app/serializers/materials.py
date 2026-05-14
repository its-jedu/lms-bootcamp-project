import os
from urllib.parse import urlparse

from rest_framework import serializers
from apps.courses_app.models import Material

FILE_TYPE = {
    ".pdf": "pdf",
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".aac": "audio",
    ".ogg": "audio",
}

ALLOWED_VIDEO_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "vimeo.com",
    "www.vimeo.com",
}

class MaterialSerializer(serializers.ModelSerializer):
    #file = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ["id", "lesson", "material_type", "filename", "storage_provider", "provider_file_id", "provider_path", "text_content", "video_url", "uploaded_at"]    
        read_only_fields = ["id", "lesson", "filename", "uploaded_at"]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        material_type = data.get("material_type")

        base_fields = {
            "id",
            "lesson",
            "material_type",
            "uploaded_at",
        }

        if material_type in ["pdf", "audio"]:
            allowed_fields = base_fields | {
                "filename",
                "storage_provider",
                "provider_file_id",
                "provider_path",
            }

        elif material_type == "text":
            allowed_fields = base_fields | {
                "text_content",
            }

        elif material_type == "video":
            allowed_fields = base_fields | {
                "video_url",
            }

        else:
            allowed_fields = base_fields

        return {
            key: value
            for key, value in data.items()
            if key in allowed_fields
        }
        
class FileMaterialUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, file):
        max_size = 10 * 1024 * 1024 # 10MB
        extension = os.path.splitext(file.name)[1].lower()
        
        if file.size > max_size:
            raise serializers.ValidationError("File size must not exceed 10MB!")
        
        if extension not in FILE_TYPE:
            raise serializers.ValidationError("Unsupported file type. Only PDF and certain audio files are allowed")

        return file

class TextMeterialSerializer(serializers.Serializer):
    text_content = serializers.CharField()

    def validate_text_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Text content cannot be empty")
        return value.strip()
    
class VideoMeterialSerializer(serializers.Serializer):
    video_url = serializers.URLField()

    def validate_video_url(self, value):
        parsed = urlparse(value)
        host = parsed.netloc.lower()

        if host not in ALLOWED_VIDEO_HOSTS:
            raise serializers.ValidationError("Unsupported video provider. Only Youtube and Vimeo links are allowed.")
        
        return value