from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from apps.admin_app.permissions import IsAdmin
from apps.courses_app.models import CourseAssignment
from apps.courses_app.serializers import (
    AssignedCourseSerializer,
    CourseAssignmentCreateSerializer,
    CourseAssignmentSerializer,
)

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

        with transaction.atomic():
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
