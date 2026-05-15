from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import os
from django.shortcuts import get_object_or_404
from apps.courses_app.services.cloudinary_storage import CloudinaryStorageService
from apps.admin_app.permissions import IsAdmin
from apps.courses_app.models import CourseAssignment, Lesson, Material
from apps.courses_app.serializers.materials import (
    FILE_TYPE,
    MaterialSerializer,
    TextMeterialSerializer,
    VideoMeterialSerializer
)

class MaterialViewSet(viewsets.ViewSet):
    parser_classes = [MultiPartParser, JSONParser]

    def get_permissions(self):
        if self.action in ["create_file", "create_text", "create_video", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def _user_can_view_material(self, user, lesson):
        if user.role == "admin":
            return True
        if user.role == "employee":
            return (
                lesson.course.status == "published" and
                CourseAssignment.objects.filter(
                    employee=user,
                    course_id=lesson.course_id,
                    is_active=True
                ).exists()
            )
        return False
    
    def _ensure_draft_course(self, course):
        if course.status == "published":
            return Response(
                {"error": "Published courses are view only."},
                status=status.HTTP_409_CONFLICT,
            )
        return None
    
    def list(self, request, lesson_id=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        if not self._user_can_view_material(request.user, lesson):
            raise PermissionDenied("You do not have permission to view materials for this lesson.")
        
        materials = lesson.materials.all()
        serializer = MaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data)
    
    def create_file(self, request, lesson_id=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        if error := self._ensure_draft_course(lesson.course):
            return error
        
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        extension = os.path.splitext(file.name)[1].lower()
        if extension not in FILE_TYPE:
            return Response({"error": "Unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)
        
        if file.size > 10 * 1024 * 1024:
            return Response({"error": "File size exceeds 10MB limit"}, status=status.HTTP_400_BAD_REQUEST)
        
        if Material.objects.filter(lesson=lesson, filename=file.name).exists():
            return Response(
                {"message": "Duplicate file. File with this name already exists."},
                status=status.HTTP_409_CONFLICT
            )
        
        storage = CloudinaryStorageService()
        try:
            uploaded = storage.upload_file(file)
        except Exception as e:
            return Response(
                {"error": f"Upload failed: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )
        
        material = Material.objects.create(
            lesson=lesson,
            material_type=FILE_TYPE[extension],
            filename=uploaded["filename"],
            storage_provider="cloudinary",
            provider_file_id=uploaded["provider_file_id"],
            provider_path=uploaded["provider_path"],
        )
        
        return Response(
            MaterialSerializer(material, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def download(self, request, lesson_id=None, pk=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        material = get_object_or_404(Material, id=pk, lesson=lesson)
        
        if not self._user_can_view_material(request.user, lesson):
            raise PermissionDenied("You do not have permission to download this material.")
        
        if material.material_type not in ("pdf", "audio"):
            return Response({"error": "Not a downloadable file"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not material.provider_path:
            return Response({"error": "No downloadable file reference available"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"download_url": material.provider_path})

    def create_text(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        if error := self._ensure_draft_course(lesson.course):
            return error
        
        serializer = TextMeterialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        material = Material.objects.create(
            lesson=lesson,
            material_type="text",
            text_content=serializer.validated_data["text_content"],
        )
        return Response(
            MaterialSerializer(material, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def create_video(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        if error := self._ensure_draft_course(lesson.course):
            return error
        
        serializer = VideoMeterialSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        material = Material.objects.create(
            lesson=lesson,
            material_type="video",
            video_url=serializer.validated_data["video_url"],
        )
        return Response(
            MaterialSerializer(material, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def destroy(self, request, lesson_id=None, pk=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        if error := self._ensure_draft_course(lesson.course):
            return error
        
        material = get_object_or_404(Material, id=pk, lesson=lesson)
        
        if material.storage_provider == "cloudinary" and material.provider_file_id:
            CloudinaryStorageService().delete_file(material.provider_file_id)
            
        material.delete()
        return Response({"message": "Material deleted successfully."})