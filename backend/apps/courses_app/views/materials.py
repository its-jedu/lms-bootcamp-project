from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import os
from django.shortcuts import get_object_or_404

from apps.admin_app.permissions import IsAdmin
from apps.courses_app.models import CourseAssignment, Lesson, Material
from apps.courses_app.serializers import (
    FILE_TYPE,
    FileMaterialUploadSerializer,
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
        if getattr(user, "role", None) == "admin":
            return True

        if getattr(user, "role", None) == "employee":
            if lesson.course.status != "published":
                return False
            
            return CourseAssignment.objects.filter(
                employee = user,
                course_id = lesson.course_id,
                is_active = True
            ).exists()
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
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def create_file(self, request, lesson_id=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        locked_response = self._ensure_draft_course(lesson.course)
        if locked_response:
            return locked_response
        
        serializer = FileMaterialUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        file = serializer.validated_data["file"]
        extension = os.path.splitext(file.name)[1].lower()
        material_type = FILE_TYPE[extension]
        filename = file.name

        duplicate_exits = Material.objects.filter(
            lesson=lesson,
            filename=filename
        ).exists()


        if not duplicate_exits:
            material = Material.objects.create(
            lesson = lesson,
            material_type = material_type,
            file = file,
            filename = filename,
        )
        else: 
            return Response({"message": "Duplicate file. A file with this same name already exists for this lesson."},
                            status=status.HTTP_409_CONFLICT)

        return Response(
            MaterialSerializer(material, context={'request': request}).data, 
            status=status.HTTP_201_CREATED)
    
    def create_text(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)

        locked_response = self._ensure_draft_course(lesson.course)
        if locked_response:
            return locked_response
        
        serializer = TextMeterialSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


        material = Material.objects.create(
            lesson=lesson,
            material_type="text",
            text_content=serializer.validated_data["text_content"],
        )

        return Response(MaterialSerializer(material, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def create_video(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)

        locked_response = self._ensure_draft_course(lesson.course)
        if locked_response:
            return locked_response
        
        serializer = VideoMeterialSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


        material = Material.objects.create(
            lesson=lesson,
            material_type="video",
            video_url=serializer.validated_data["video_url"],
        )

        return Response(MaterialSerializer(material, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, lesson_id=None, pk=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        locked_response = self._ensure_draft_course(lesson.course)
        if locked_response:
            return locked_response
        
        material = get_object_or_404(Material, id=pk, lesson=lesson)

        if material.file:
            material.file.delete(save=False)
        
        material.delete()

        return Response({"message": "Material deleted successfully."}, status=status.HTTP_200_OK)