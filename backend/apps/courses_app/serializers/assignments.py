from rest_framework import serializers
from apps.auth_app.models import User
from apps.courses_app.models import CourseAssignment, Course

# For Admin Create assignment
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