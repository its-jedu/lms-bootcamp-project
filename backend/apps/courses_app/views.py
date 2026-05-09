import os
from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from apps.admin_app.permissions import IsAdmin
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Lesson, Material, CourseAssignment
from .serializers import (
    CourseSerializer, 
    CourseUpdateSerializer, 
    LessonSerializer, 
    MaterialSerializer,
    FileMaterialUploadSerializer,
    TextMeterialSerializer,
    VideoMeterialSerializer,
    CourseAssignmentCreateSerializer,
    CourseAssignmentSerializer,
    AssignedCourseSerializer,
    FILE_TYPE,
)
from rest_framework.decorators import action

from django.db import transaction

class CourseViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["create", "publish", "partial_update"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def _get_courses(self):
        if self.request.user.role == "admin":
            return Course.objects.all()
        return Course.objects.filter(
            employee_assignments__employee=self.request.user,
            employee_assignments__is_active=True,
            status="published"
        ).distinct()

    def list(self, request):
        serializer = CourseSerializer(self._get_courses(), many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        course = get_object_or_404(self._get_courses(), pk=pk)
        return Response(CourseSerializer(course).data)
    
    def create(self, request):
        serializer = CourseSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        course = serializer.save(status="draft")
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=["patch"])
    def publish(self, request, pk=None):
        course = get_object_or_404(Course, pk=pk)
        course.status = "published"
        course.save(update_fields=["status", "updated_at"])
        return Response(CourseSerializer(course).data)
    
    def partial_update(self, request, pk=None):
        course = get_object_or_404(Course, pk=pk)

        serializer = CourseUpdateSerializer(
            course,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        serializer.save()
        return Response(CourseSerializer(course).data)

    
class CourseAssignmentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "list"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def create(self, request):
        serializer = CourseAssignmentCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        employee_ids = serializer.validated_data["employee_ids"]
        course_ids = serializer.validated_data["course_ids"]

        existing_pairs = set(
            CourseAssignment.objects.filter(
                employee_id__in=employee_ids,
                course_id__in=course_ids
            ).values_list("employee_id", "course_id")
        )

        created_assignments = []

        for employee_id in employee_ids:
            for course_id in course_ids:
                if (employee_id, course_id) in existing_pairs:
                    continue

                assignment = CourseAssignment.objects.create(
                    employee_id=employee_id,
                    course_id=course_id,
                    progress_status="not_started",
                    is_active=True
                )
                created_assignments.append(assignment)

        if len(created_assignments) == 0:
            return Response(
                {"error": "Duplicate assignment. Employee has already been assigned to the selected course(s)."},
                status=status.HTTP_409_CONFLICT
            )

        return Response(
            {
                "message": "Course assignment processed successfully.",
                "created_count": len(created_assignments),
            },
            status=status.HTTP_201_CREATED
        )

    def list(self, request):
        assignments = CourseAssignment.objects.select_related("employee", "course").all()
        serializer = CourseAssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def my_courses(self, request):
        if getattr(request.user, "role", None) != "employee":
            return Response(
                {"error": "Admin doesn't have access to the Employee Course Dashboard."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # NOT necessary as authentication logic checks this condition
        elif not request.user.is_active:
            return Response(
                {"error": "Unauthorized access not allowed."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        assignments = CourseAssignment.objects.select_related("course").filter(
            employee=request.user,
            is_active=True,
            course__status="published"
        )

        serializer = AssignedCourseSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class LessonViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["create", "partial_update", "reorder", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def list(self, request, course_id=None):
        if request.user.role == "admin":
            course = get_object_or_404(Course, pk=course_id)
        
        else:
            course = get_object_or_404(
                Course, 
                pk=course_id, 
                status="published",
                employee_assignments__employee=request.user,
                employee_assignments__is_active=True,
            )

        serializer = LessonSerializer(course.lessons.all(), many=True)
        return Response(serializer.data)

    def create(self, request, course_id=None):
        course = get_object_or_404(Course, pk=course_id)

        serializer = LessonSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        serializer.save(course=course, order=course.lessons.count() + 1)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, course_id=None, pk=None):
        course = get_object_or_404(Course, pk=course_id)
        lesson = get_object_or_404(Lesson, pk=pk, course=course)

        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        serializer.save()
        return Response(serializer.data)

    def reorder(self, request, course_id=None):
        course = get_object_or_404(Course, pk=course_id)
        lesson_ids = request.data.get("lesson_ids")

        if not isinstance(lesson_ids, list) or not lesson_ids:
            return Response(
                {"lesson_ids": ["This field must be a non-empty list."]},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        
        try:
            lesson_ids = [int(lesson_id) for lesson_id in lesson_ids]
        except (TypeError, ValueError):
            return Response(
                {"lesson_ids": ["Lesson ids must be integers."]},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,)
        
        if len(lesson_ids) != len(set(lesson_ids)):
            return Response(
                {"lesson_ids": ["Lesson ids must not contain duplicates."]},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        
        lessons = list(course.lessons.filter(id__in=lesson_ids))

        if len(lessons) != len(lesson_ids):
            return Response(
                {"lesson_ids": ["All lessons must belong to this course."]},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        
        lesson_by_id = {lesson.id: lesson for lesson in lessons}

        with transaction.atomic():
            for index, lesson_id in enumerate(lesson_ids, start=1):
                lesson = lesson_by_id[lesson_id]
                lesson.order = index
                lesson.save(update_fields=["order", "updated_at"])
        
        serializer = LessonSerializer(course.lessons.all(), many=True)
        return Response(serializer.data)
    
    def destroy(self, request, course_id=None, pk=None):
        course = get_object_or_404(Course, pk=course_id)
        lesson = get_object_or_404(Lesson, pk=pk, course=course)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
            return CourseAssignment.objects.filter(
                employee = user,
                course_id = lesson.course_id,
                is_active = True
            ).exists()
        return False
    
    def list(self, request, lesson_id=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        if not self._user_can_view_material(request.user, lesson):
            raise PermissionDenied("You do not have permission to view materials for this lesson.")
        
        materials = lesson.materials.all()
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def create_file(self, request, lesson_id=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
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
            MaterialSerializer(material).data, 
            status=status.HTTP_201_CREATED)
    
    def create_text(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)
        serializer = TextMeterialSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


        material = Material.objects.create(
            lesson=lesson,
            material_type="text",
            text_content=serializer.validated_data["text_content"],
        )

        return Response(MaterialSerializer(material).data, status=status.HTTP_201_CREATED)

    def create_video(self, request, lesson_id=None): 
        lesson = get_object_or_404(Lesson, id=lesson_id)
        serializer = VideoMeterialSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


        material = Material.objects.create(
            lesson=lesson,
            material_type="video",
            video_url=serializer.validated_data["video_url"],
        )

        return Response(MaterialSerializer(material).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, lesson_id=None, pk=None):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        material = get_object_or_404(Material, id=pk, lesson=lesson)

        if material.file:
            material.file.delete(save=False)
        
        material.delete()

        return Response({"message": "Material deleted successfully."}, status=status.HTTP_200_OK)