from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User
from apps.courses_app.models import Course, CourseAssignment, Lesson, Material

class CourseAssignmentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpass123",
            role="admin",
            is_active=True
        )

        self.employee1 = User.objects.create_user(
            email="employee1@example.com",
            password="employeepass123",
            role="employee",
            is_active=True,
        )

        self.employee2 = User.objects.create_user(
            email="employee2@example.com",
            password="employeepass123",
            role="employee",
            is_active=True,
        )

        self.inactive_employee_user = User.objects.create_user(
            email="employee3@example.com",
            password="employeepass123",
            role="employee",
            is_active=False,
        )

        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.employee_token_1 = str(RefreshToken.for_user(self.employee1).access_token)
        self.employee_token_2 = str(RefreshToken.for_user(self.employee2).access_token)
        self.inactive_employee_token = str(RefreshToken.for_user(self.inactive_employee_user).access_token)

        self.course_1 = Course.objects.create(
            title="Published Course 1",
            description="Desc 1",
            status="published"
        )

        self.course_2 = Course.objects.create(
            title="Published Course 2",
            description="Desc 2",
            status="published"
        )

        self.draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft"
        )

    def test_admin_can_assign_courses_to_multiple_employees(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.employee1.id, self.employee2.id],
                "course_ids": [self.course_1.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CourseAssignment.objects.count(), 2)
        self.assertEqual(
            response.data["message"],
            "Course assignment processed successfully."
        )

    def test_admin_can_assign_multiple_courses_to_multiple_employees(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.employee1.id, self.employee2.id],
                "course_ids": [self.course_1.id, self.course_2.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CourseAssignment.objects.count(), 4)
        self.assertEqual(
            response.data["message"],
            "Course assignment processed successfully."
        )

    def test_duplicate_assignments_are_prevented(self):
        CourseAssignment.objects.create(
        employee=self.employee1,
        course=self.course_1
    )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.employee1.id],
                "course_ids": [self.course_1.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(CourseAssignment.objects.count(), 1)
        self.assertIn("error", response.data)

    def test_inactive_employee_cannot_be_assigned(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.inactive_employee_user.id],
                "course_ids": [self.course_1.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn("employee_ids", response.data)

    def test_admin_cannot_assign_draft_courses(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.employee1.id],
                "course_ids": [self.draft_course.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn("course_ids", response.data)

    def test_admin_can_list_all_assignments(self):
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_1)
        CourseAssignment.objects.create(employee=self.employee2, course=self.course_2)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.get("/api/admin/course-assignments/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_employee_can_view_assigned_courses_if_active(self):
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_1)
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_2)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")

        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_employee_sees_only_their_own_assigned_courses(self):
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_1)
        CourseAssignment.objects.create(employee=self.employee2, course=self.course_2)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")

        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["course_id"], self.course_1.id)

    def test_inactive_employee_cannot_view_assigned_courses(self):
        CourseAssignment.objects.create(employee=self.inactive_employee_user, course=self.course_1)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.inactive_employee_token}")

        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employee_cannot_create_assignments(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")

        response = self.client.post(
            "/api/admin/course-assignments/",
            {
                "employee_ids": [self.employee2.id],
                "course_ids": [self.course_1.id]
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_access_employee_dashboard_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


    def test_employee_cannot_see_unassigned_courses_in_assigned_courses_endpoint(self):
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_1)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")
        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_course_ids = [item["course_id"] for item in response.data]

        self.assertIn(self.course_1.id, returned_course_ids)
        self.assertNotIn(self.course_2.id, returned_course_ids)    

    def test_employee_cannot_access_material_of_unassigned_course(self):
        unassigned_course = Course.objects.create(
            title="Unassigned Course",
            description="Restricted",
            status="published"
        )

        unassigned_lesson = Lesson.objects.create(
            course=unassigned_course,
            title="Restricted Lesson",
            objective="Restricted objective",
            order=1
        )

        Material.objects.create(
            lesson=unassigned_lesson,
            material_type="text",
            text_content="Restricted material"
        )

        # employee1 is NOT assigned to unassigned_course
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")
        response = self.client.get(f"/api/lessons/{unassigned_lesson.id}/materials/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_can_access_material_of_assigned_course(self):
        assigned_course = Course.objects.create(
            title="Assigned Course",
            description="Allowed",
            status="published"
        )

        assigned_lesson = Lesson.objects.create(
            course=assigned_course,
            title="Allowed Lesson",
            objective="Allowed objective",
            order=1
        )

        Material.objects.create(
            lesson=assigned_lesson,
            material_type="text",
            text_content="Allowed material"
        )

        CourseAssignment.objects.create(
            employee=self.employee1,
            course=assigned_course,
            is_active=True
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")
        response = self.client.get(f"/api/lessons/{assigned_lesson.id}/materials/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_employee_course_list_only_returns_assigned_courses(self):
        CourseAssignment.objects.create(employee=self.employee1, course=self.course_1)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")
        response = self.client.get("/api/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course_1.id, returned_course_ids)
        self.assertNotIn(self.course_2.id, returned_course_ids)

    def test_employee_cannot_list_lessons_for_unassigned_course(self):
        Lesson.objects.create(
            course=self.course_2,
            title="Unassigned Lesson",
            objective="Hidden",
            order=1,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token_1}")
        response = self.client.get(f"/api/courses/{self.course_2.id}/lessons/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
