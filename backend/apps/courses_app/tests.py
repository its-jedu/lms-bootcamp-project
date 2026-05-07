from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.auth_app.models import User
from .models import Course, Lesson, Material, CourseAssignment

class LessonAPITests(TestCase):
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

    def test_admin_can_create_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
                f"/api/courses/{self.course.id}/lessons/",
                {
                    "title": "Introduction",
                    "objective": "Understand the course structure",
                }
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Introduction")
        self.assertEqual(response.data["objective"], "Understand the course structure")
        self.assertEqual(response.data["order"], 1)
        self.assertEqual(Lesson.objects.count(), 1)

        lesson = Lesson.objects.get()
        self.assertEqual(lesson.course, self.course)
    
    def test_admin_can_update_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Old Title",
            objective="Old objective",
            order=1,
        )

        response = self.client.patch(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/",
            {
                "title": "Updated Title",
                "objective": "Updated objective",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")
        self.assertEqual(response.data["objective"], "Updated objective")

        lesson.refresh_from_db()
        self.assertEqual(lesson.title, "Updated Title")
        self.assertEqual(lesson.objective, "Updated objective")
    
    def test_admin_can_delete_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Lesson to delete",
            objective="Delete objective",
            order=1,
        )

        response = self.client.delete(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Lesson.objects.count(), 0)

    def test_employee_cannot_create_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/",
            {
                "title": "Introduction",
                "objective": "Understand the course structure",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lesson.objects.count(), 0)
    
    def test_employee_cannot_update_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Old title",
            objective="Old objective",
            order=1,
        )

        response = self.client.patch(
            f'/api/courses/{self.course.id}/lessons/{lesson.id}/',
            {
                'title': "Updated Title",
                "objective": "Updated objective"
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        lesson.refresh_from_db()
        self.assertEqual(lesson.title, "Old title")
        self.assertEqual(lesson.objective, "Old objective")

    def test_employee_cannot_delete_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Lesson to delete",
            objective="Delete objective",
            order=1,
        )

        response = self.client.delete(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Lesson.objects.count(), 1)

    def test_admin_can_reorder_lessons(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        lesson_one = Lesson.objects.create(
            course=self.course,
            title="Lesson One",
            objective="First",
            order=1,
        )
        lesson_two = Lesson.objects.create(
            course=self.course,
            title="Lesson Two",
            objective="Second",
            order=2,
        )
        lesson_three = Lesson.objects.create(
            course=self.course,
            title="Lesson Three",
            objective="Third",
            order=3,
        )

        response = self.client.patch(
            f"/api/courses/{self.course.id}/lessons/reorder/",
            {
                "lesson_ids": [lesson_three.id, lesson_one.id, lesson_two.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [lesson["id"] for lesson in response.data],
            [lesson_three.id, lesson_one.id, lesson_two.id],
        )

        lesson_one.refresh_from_db()
        lesson_two.refresh_from_db()
        lesson_three.refresh_from_db()

        self.assertEqual(lesson_three.order, 1)
        self.assertEqual(lesson_one.order, 2)
        self.assertEqual(lesson_two.order, 3)

        list_response = self.client.get(
        f"/api/courses/{self.course.id}/lessons/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [lesson["id"] for lesson in list_response.data],
            [lesson_three.id, lesson_one.id, lesson_two.id],
        )
    
    def test_employee_cannot_reorder_lessons(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        lesson_one = Lesson.objects.create(
            course=self.course,
            title="Lesson One",
            objective="First",
            order=1,
        )
        lesson_two = Lesson.objects.create(
            course=self.course,
            title="Lesson Two",
            objective="Second",
            order=2,
        )

        response = self.client.patch(
            f"/api/courses/{self.course.id}/lessons/reorder/",
            {
                "lesson_ids": [lesson_two.id, lesson_one.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        lesson_one.refresh_from_db()
        lesson_two.refresh_from_db()

        self.assertEqual(lesson_one.order, 1)
        self.assertEqual(lesson_two.order, 2)
    
    def test_employee_can_list_published_course_lessons_in_order(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        Lesson.objects.create(
            course=self.course,
            title="Second Lesson",
            objective="Second",
            order=2,
        )
        Lesson.objects.create(
            course=self.course,
            title="First Lesson",
            objective="First",
            order=1,
        )
        Lesson.objects.create(
            course=self.course,
            title="Third Lesson",
            objective="Third",
            order=3,
        )

        response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [lesson["title"] for lesson in response.data],
            ["First Lesson", "Second Lesson", "Third Lesson"],
        )

    def test_employee_cannot_list_draft_course_lessons(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Hidden from employees",
            status="draft",
        )

        Lesson.objects.create(
            course=draft_course,
            title="Draft Lesson",
            objective="Hidden lesson",
            order=1,
        )

        response = self.client.get(
            f"/api/courses/{draft_course.id}/lessons/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

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
    
    def test_admin_can_publish_course_with_patch(self):
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

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "published")

        draft_course.refresh_from_db()
        self.assertEqual(draft_course.status, "published")
    
    def test_admin_can_unpublish_course_with_patch(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.patch(
            f"/api/courses/{self.course.id}/",
            {"status": "draft"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "draft")

        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "draft")

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

        response = self.client.patch(
            f"/api/courses/{self.course.id}/",
            {"status": "archived"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "published")

class MaterialAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpass123",
            role="admin"
        )

        self.employee_user = User.objects.create_user(
            email="employee@example.com",
            password="employeepass123",
            role="employee"
        )

        self.other_employee_user = User.objects.create_user(
            email="employee2@example.com",
            password="employeepass123",
            role="employee"
        )

        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.employee_token = str(RefreshToken.for_user(self.employee_user).access_token)
        self.other_employee_token = str(RefreshToken.for_user(self.other_employee_user).access_token)

        self.course = Course.objects.create(
            title="Course 1",
            description="Test course",
            status="draft"
        )

        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Lesson objective",
            order=1
        )

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True
        )

    def test_admin_can_upload_pdf_material_to_lesson(self):
        pdf_file = SimpleUploadedFile(
            "test.pdf",
            b"%PDF-1.4 test content",
            content_type="application/pdf"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": pdf_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Material.objects.count(), 1)
        self.assertEqual(response.data["material_type"], "pdf")
        self.assertEqual(response.data["filename"], "test.pdf")
        self.assertEqual(response.data["lesson"], self.lesson.id)

    def test_admin_can_upload_audio_material_to_lesson(self):
        audio_file = SimpleUploadedFile(
            "audio.mp3",
            b"fake audio bytes",
            content_type="audio/mpeg"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": audio_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Material.objects.count(), 1)
        self.assertEqual(response.data["material_type"], "audio")
        self.assertEqual(response.data["filename"], "audio.mp3")

    def test_admin_cannot_upload_duplicate_filename_to_same_lesson(self):
        Material.objects.create(
            lesson=self.lesson,
            material_type="pdf",
            file=SimpleUploadedFile("test.pdf", b"%PDF-1.4 first", content_type="application/pdf"),
            filename="test.pdf"
        )

        duplicate_file = SimpleUploadedFile(
            "test.pdf",
            b"%PDF-1.4 second",
            content_type="application/pdf"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": duplicate_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(Material.objects.count(), 1)

    def test_admin_cannot_upload_invalid_file_type(self):
        txt_file = SimpleUploadedFile(
            "notes.txt",
            b"plain text",
            content_type="text/plain"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": txt_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(Material.objects.count(), 0)

    def test_admin_cannot_upload_file_above_10mb(self):
        big_file = SimpleUploadedFile(
            "big.pdf",
            b"a" * (10 * 1024 * 1024 + 1),
            content_type="application/pdf"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": big_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(Material.objects.count(), 0)

    def test_admin_can_create_text_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/text/",
            {"text_content": "Lesson notes go here"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Material.objects.count(), 1)
        self.assertEqual(response.data["material_type"], "text")
        self.assertEqual(response.data["text_content"], "Lesson notes go here")

    def test_admin_cannot_create_empty_text_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/text/",
            {"text_content": "   "},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(Material.objects.count(), 0)

    def test_admin_can_create_video_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/video/",
            {"video_url": "https://www.youtube.com/watch?v=abc123"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Material.objects.count(), 1)
        self.assertEqual(response.data["material_type"], "video")
        self.assertIn("youtube.com", response.data["video_url"])
        self.assertIn("abc123", response.data["video_url"])

    def test_admin_cannot_create_video_material_with_unsupported_provider(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/video/",
            {"video_url": "https://example.com/video/123"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(Material.objects.count(), 0)

    def test_admin_can_list_materials_for_lesson(self):
        Material.objects.create(
            lesson=self.lesson,
            material_type="text",
            text_content="Material 1"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.get(f"/api/lessons/{self.lesson.id}/materials/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_assigned_employee_can_list_materials_for_lesson(self):
        Material.objects.create(
            lesson=self.lesson,
            material_type="text",
            text_content="Employee visible material"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        response = self.client.get(f"/api/lessons/{self.lesson.id}/materials/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_unassigned_employee_cannot_list_materials_for_lesson(self):
        Material.objects.create(
            lesson=self.lesson,
            material_type="text",
            text_content="Restricted material"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_employee_token}")
        response = self.client.get(f"/api/lessons/{self.lesson.id}/materials/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_upload_file_material(self):
        pdf_file = SimpleUploadedFile(
            "test.pdf",
            b"%PDF-1.4 test content",
            content_type="application/pdf"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": pdf_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_create_text_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/text/",
            {"text_content": "Should not be created"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_create_video_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/video/",
            {"video_url": "https://www.youtube.com/watch?v=abc123"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_material(self):
        material = Material.objects.create(
            lesson=self.lesson,
            material_type="text",
            text_content="Delete me"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        response = self.client.delete(
            f"/api/lessons/{self.lesson.id}/materials/{material.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Material.objects.count(), 0)

    def test_employee_cannot_delete_material(self):
        material = Material.objects.create(
            lesson=self.lesson,
            material_type="text",
            text_content="Protected"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        response = self.client.delete(
            f"/api/lessons/{self.lesson.id}/materials/{material.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Material.objects.count(), 1)

    def test_unauthenticated_user_cannot_list_materials(self):
        response = self.client.get(f"/api/lessons/{self.lesson.id}/materials/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_upload_file_material(self):
        pdf_file = SimpleUploadedFile(
            "test.pdf",
            b"%PDF-1.4 test content",
            content_type="application/pdf"
        )

        response = self.client.post(
            f"/api/lessons/{self.lesson.id}/materials/file/",
            {"file": pdf_file},
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)