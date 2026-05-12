from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User
from apps.courses_app.models import Course

class CourseAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpass123",
            role="admin",
        )
        self.employee_user = User.objects.create_user(
            email="employee@example.com",
            password="employeepass123",
            role="employee",
        )

        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.employee_token = str(RefreshToken.for_user(self.employee_user).access_token)

        self.course = Course.objects.create(
            title="Test Course",
            description="Course for lesson tests",
            status="published",
        )
    
    def test_admin_can_publish_draft_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft",
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/publish/",
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "published")

        draft_course.refresh_from_db()
        self.assertEqual(draft_course.status, "published")
    
    def test_admin_cannot_publish_draft_course_through_regular_update(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft",
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/",
            {"status": "published"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        draft_course.refresh_from_db()
        self.assertEqual(draft_course.status, "draft")

    def test_admin_cannot_unpublish_course_with_patch(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.patch(
            f"/api/courses/{self.course.id}/",
            {"status": "draft"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "published")

    def test_admin_can_update_draft_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft",
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/",
            {
                "title": "Updated Draft Course",
                "description": "Updated draft description",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Draft Course")
        self.assertEqual(response.data["description"], "Updated draft description")

        draft_course.refresh_from_db()
        self.assertEqual(draft_course.title, "Updated Draft Course")
        self.assertEqual(draft_course.description, "Updated draft description")

    def test_admin_cannot_update_published_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.patch(
            f"/api/courses/{self.course.id}/",
            {
                "title": "Should Not Change",
                "description": "Should not change",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        self.course.refresh_from_db()
        self.assertEqual(self.course.title, "Test Course")
        self.assertEqual(self.course.description, "Course for lesson tests")

    def test_admin_can_delete_draft_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft",
        )

        response = self.client.delete(f"/api/courses/{draft_course.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(id=draft_course.id).exists())

    def test_admin_cannot_delete_published_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.delete(f"/api/courses/{self.course.id}/")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(Course.objects.filter(id=self.course.id).exists())

    def test_employee_cannot_update_course_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response = self.client.patch(
            f"/api/courses/{self.course.id}/",
            {"status": "draft"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "published")
    
    def test_admin_cannot_set_invalid_course_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Draft",
            status="draft",
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/",
            {"status": "archived"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        draft_course.refresh_from_db()
        self.assertEqual(draft_course.status, "draft")
