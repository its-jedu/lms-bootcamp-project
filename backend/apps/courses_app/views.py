from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import transaction

from apps.admin_app.permissions import IsAdmin
from .models import Course, Lesson
from .serializers import CourseSerializer, CourseUpdateSerializer, LessonSerializer

class CourseViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["create", "publish", "partial_update"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def _get_courses(self):
        if self.request.user.role == "admin":
            return Course.objects.all()
        return Course.objects.filter(status="published")

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
    
class LessonViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["create", "partial_update", "reorder", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def list(self, request, course_id=None):
        if request.user.role == "admin":
            course = get_object_or_404(Course, pk=course_id)
        
        else:
            course = get_object_or_404(Course, pk=course_id, status="published")

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