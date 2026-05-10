from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.admin_app.permissions import IsAdmin
from apps.courses_app.models import Course
from apps.courses_app.serializers import CourseSerializer, CourseUpdateSerializer

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
