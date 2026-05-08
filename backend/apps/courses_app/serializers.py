import os
from urllib.parse import urlparse
from rest_framework import serializers
from apps.auth_app.models import User
from .models import Course, Lesson, Material, CourseAssignment

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
}

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "status", "created_at", "updated_at"]
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()

class CourseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["title", "description", "status"]
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "objective",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "course", "order", "created_at", "updated_at"]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ["id", "lesson", "material_type", "file", "filename", "text_content", "video_url", "uploaded_at"]    
        read_only_fields = ["id", "lesson", "filename", "uploaded_at"]
        
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
            raise serializers.ValidationError("Unsupported video provider. Only Youtube links are allowed.")
        
        return value
    
class CourseAssignmentCreateSerializer(serializers.Serializer):
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )
    course_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_employee_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Employee ids must not contain duplicates.")

        employees = User.objects.filter(id__in=value, role="employee", is_active = True)
        if employees.count() != len(value):
            raise serializers.ValidationError("All employee ids must belong to existing employees.")

        return value

    def validate_course_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Course ids must not contain duplicates.")

        courses = Course.objects.filter(id__in=value, status="published")
        if courses.count() != len(value):
            raise serializers.ValidationError("All course ids must belong to existing published courses.")

        return value

# For admin assignment response
class CourseAssignmentSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source="employee.id", read_only=True)
    employee_email = serializers.EmailField(source="employee.email", read_only=True)
    course_id = serializers.IntegerField(source="course.id", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = CourseAssignment
        fields = [
            "id",
            "employee_id",
            "employee_email",
            "course_id",
            "course_title",
            "progress_status",
            "assigned_at",
            "started_at",
            "completed_at",
            "is_active",
        ]

# For employee assigned-course dashboard responses
class AssignedCourseSerializer(serializers.ModelSerializer):
    assignment_id = serializers.IntegerField(source="id", read_only=True)
    course_id = serializers.IntegerField(source="course.id", read_only=True)
    title = serializers.CharField(source="course.title", read_only=True)
    description = serializers.CharField(source="course.description", read_only=True)

    class Meta:
        model = CourseAssignment
        fields = [
            "assignment_id",
            "course_id",
            "title",
            "description",
            "progress_status",
            "assigned_at",
            "started_at",
            "completed_at",
        ]