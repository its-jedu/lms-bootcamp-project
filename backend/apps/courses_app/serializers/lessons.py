from rest_framework import serializers
from apps.courses_app.models import Lesson

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