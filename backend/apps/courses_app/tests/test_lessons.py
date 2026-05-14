from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_app.models import User
from apps.courses_app.models import Course, Lesson, CourseAssignment, LessonProgress

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

        self.other_employee_user = User.objects.create_user(
            email="otheremployee@example.com",
            password="employeepass123",
            role="employee",
            is_active=True,
        )

        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.employee_token = str(RefreshToken.for_user(self.employee_user).access_token)
        self.other_employee_token = str(RefreshToken.for_user(self.other_employee_user).access_token)

        self.course = Course.objects.create(
            title="Test Course",
            description="Course for lesson tests",
            status="published",
        )

    def test_admin_can_create_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        draft_course = Course.objects.create(
            title="Draft Course",
            description="Editable",
            status="draft",
        )

        response = self.client.post(
                f"/api/courses/{draft_course.id}/lessons/",
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
        self.assertEqual(lesson.course, draft_course)
    
    def test_admin_can_update_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        draft_course = Course.objects.create(
            title="Draft Course",
            description="Editable",
            status="draft",
        )

        lesson = Lesson.objects.create(
            course=draft_course,
            title="Old Title",
            objective="Old objective",
            order=1,
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/lessons/{lesson.id}/",
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
        draft_course = Course.objects.create(
            title="Draft Course",
            description="Editable",
            status="draft",
        )

        lesson = Lesson.objects.create(
            course=draft_course,
            title="Lesson to delete",
            objective="Delete objective",
            order=1,
        )

        response = self.client.delete(
            f"/api/courses/{draft_course.id}/lessons/{lesson.id}/"
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
        draft_course = Course.objects.create(
            title="Draft Course",
            description="Editable",
            status="draft",
        )

        lesson_one = Lesson.objects.create(
            course=draft_course,
            title="Lesson One",
            objective="First",
            order=1,
        )
        lesson_two = Lesson.objects.create(
            course=draft_course,
            title="Lesson Two",
            objective="Second",
            order=2,
        )
        lesson_three = Lesson.objects.create(
            course=draft_course,
            title="Lesson Three",
            objective="Third",
            order=3,
        )

        response = self.client.patch(
            f"/api/courses/{draft_course.id}/lessons/reorder/",
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
        f"/api/courses/{draft_course.id}/lessons/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [lesson["id"] for lesson in list_response.data],
            [lesson_three.id, lesson_one.id, lesson_two.id],
        )

    def test_admin_cannot_mutate_published_course_lessons(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Published Lesson",
            objective="Locked",
            order=1,
        )

        create_response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/",
            {
                "title": "New Lesson",
                "objective": "Should not be created",
            },
        )

        update_response = self.client.patch(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/",
            {
                "title": "Updated Title",
                "objective": "Updated objective",
            },
        )

        reorder_response = self.client.patch(
            f"/api/courses/{self.course.id}/lessons/reorder/",
            {"lesson_ids": [lesson.id]},
            format="json",
        )

        delete_response = self.client.delete(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(create_response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(update_response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(reorder_response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(delete_response.status_code, status.HTTP_409_CONFLICT)

        lesson.refresh_from_db()
        self.assertEqual(lesson.title, "Published Lesson")
        self.assertEqual(Lesson.objects.count(), 1)
    
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

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True,
        )

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

    def test_unassigned_employee_cannot_list_course_lessons(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        Lesson.objects.create(
            course=self.course,
            title="Restricted Lesson",
            objective="Restricted",
            order=1,
        )

        response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_can_navigate_lessons_in_sequence(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True,
        )

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

        first_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_one.id}/"
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertIsNone(first_response.data["previous_lesson"])
        self.assertFalse(first_response.data["can_go_previous"])
        self.assertEqual(first_response.data["next_lesson"]["id"], lesson_two.id)
        self.assertTrue(first_response.data["can_go_next"])

        second_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_two.id}/"
        )

        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.data["previous_lesson"]["id"], lesson_one.id)
        self.assertTrue(second_response.data["can_go_previous"])
        self.assertEqual(second_response.data["next_lesson"]["id"], lesson_three.id)
        self.assertTrue(second_response.data["can_go_next"])

        third_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_three.id}/"
        )

        self.assertEqual(third_response.status_code, status.HTTP_200_OK)
        self.assertEqual(third_response.data["previous_lesson"]["id"], lesson_two.id)
        self.assertTrue(third_response.data["can_go_previous"])
        self.assertIsNone(third_response.data["next_lesson"])
        self.assertFalse(third_response.data["can_go_next"])
    
    def test_lesson_navigation_follows_lesson_order(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True,
        )

        lesson_two = Lesson.objects.create(
            course=self.course,
            title="Second Lesson",
            objective="Second",
            order=2,
        )
        lesson_one = Lesson.objects.create(
            course=self.course,
            title="First Lesson",
            objective="First",
            order=1,
        )
        lesson_three = Lesson.objects.create(
            course=self.course,
            title="Third Lesson",
            objective="Third",
            order=3,
        )

        first_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_one.id}/"
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertIsNone(first_response.data["previous_lesson"])
        self.assertEqual(first_response.data["next_lesson"]["id"], lesson_two.id)

        second_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_two.id}/"
        )

        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.data["previous_lesson"]["id"], lesson_one.id)
        self.assertEqual(second_response.data["next_lesson"]["id"], lesson_three.id)

        third_response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson_three.id}/"
        )

        self.assertEqual(third_response.status_code, status.HTTP_200_OK)
        self.assertEqual(third_response.data["previous_lesson"]["id"], lesson_two.id)
        self.assertIsNone(third_response.data["next_lesson"])

    def test_assigned_employee_can_retrieve_lesson_detail(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True,
        )

        lesson = Lesson.objects.create(
            course=self.course,
            title="Accessible Lesson",
            objective="Allowed",
            order=1,
        )

        response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], lesson.id)
        self.assertEqual(response.data["title"], "Accessible Lesson")
        self.assertIn("previous_lesson", response.data)
        self.assertIn("next_lesson", response.data)
        self.assertIn("can_go_previous", response.data)
        self.assertIn("can_go_next", response.data)

    def test_unassigned_employee_cannot_retrieve_lesson_detail(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        lesson = Lesson.objects.create(
            course=self.course,
            title="Restricted Lesson",
            objective="Restricted",
            order=1,
        )

        response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_retrieve_draft_course_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")
        
        draft_course = Course.objects.create(
            title="Draft Course",
            description="Hidden",
            status="draft",
        )

        lesson = Lesson.objects.create(
            course=draft_course,
            title="Draft Lesson",
            objective="Hidden",
            order=1,
        )

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=draft_course,
            is_active=True,
        )

        response = self.client.get(
            f"api/courses/{draft_course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_cannot_retrieve_lesson_from_another_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        other_course = Course.objects.create(
            title="Other Course",
            description="Other",
            status="published",
        )

        lesson = Lesson.objects.create(
            course=other_course,
            title="Other Course Lesson",
            objective="Other",
            order=1,
        )

        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            is_active=True,
        )
        CourseAssignment.objects.create(
            employee=self.employee_user,
            course=other_course,
            is_active=True,
        )

        response = self.client.get(
            f"/api/courses/{self.course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_retrieve_draft_course_lesson(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        draft_course = Course.objects.create(
            title="Draft Course",
            description="Admin visible",
            status="draft",
        )

        lesson = Lesson.objects.create(
            course=draft_course,
            title="Draft Lesson",
            objective="Admin can view",
            order=1,
        )

        response = self.client.get(
            f"/api/courses/{draft_course.id}/lessons/{lesson.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], lesson.id)
        self.assertEqual(response.data["title"], "Draft Lesson")
        self.assertIsNone(response.data["previous_lesson"])
        self.assertIsNone(response.data["next_lesson"])
        self.assertFalse(response.data["can_go_previous"])
        self.assertFalse(response.data["can_go_next"])

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

    # PROGRESS TESTING

    def test_opening_course_does_not_change_progress_status(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response = self.client.get(f"/api/courses/{self.course.id}/lessons/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "not_started")
        self.assertIsNone(self.assignment.started_at)
        self.assertIsNone(self.assignment.completed_at)

    def test_marking_first_lesson_done_sets_course_in_progress(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "in_progress")
        self.assertIsNotNone(self.assignment.started_at)
        self.assertIsNone(self.assignment.completed_at)

        progress = LessonProgress.objects.get(
            employee=self.employee_user,
            lesson=lesson_1,
        )
        self.assertEqual(progress.status, "done")
        self.assertIsNotNone(progress.completed_at)

    def test_marking_all_lessons_done_sets_course_completed(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response_1 = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/"
        )
        response_2 = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_2.id}/complete/"
        )

        self.assertEqual(response_1.status_code, status.HTTP_200_OK)
        self.assertEqual(response_2.status_code, status.HTTP_200_OK)

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "completed")
        self.assertIsNotNone(self.assignment.started_at)
        self.assertIsNotNone(self.assignment.completed_at)

    def test_toggling_done_lesson_back_to_not_done_changes_completed_to_in_progress(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        self.client.post(f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/")
        self.client.post(f"/api/courses/{self.course.id}/lessons/{lesson_2.id}/complete/")

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "completed")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_2.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "in_progress")
        self.assertIsNone(self.assignment.completed_at)

        progress = LessonProgress.objects.get(
            employee=self.employee_user,
            lesson=lesson_2,
        )
        self.assertEqual(progress.status, "not_done")
        self.assertIsNone(progress.completed_at)

    def test_toggling_last_done_lesson_back_to_not_done_changes_in_progress_to_not_started(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        self.client.post(f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/")

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "in_progress")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.progress_status, "not_started")
        self.assertIsNone(self.assignment.started_at)
        self.assertIsNone(self.assignment.completed_at)

        progress = LessonProgress.objects.get(
            employee=self.employee_user,
            lesson=lesson_1,
        )
        self.assertEqual(progress.status, "not_done")
        self.assertIsNone(progress.completed_at)

    def test_one_lesson_course_goes_directly_to_completed(self):
        single_course = Course.objects.create(
            title="Single Lesson Course",
            description="One lesson only",
            status="published",
        )

        single_lesson = Lesson.objects.create(
            course=single_course,
            title="Only Lesson",
            objective="Only objective",
            order=1,
        )

        single_assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=single_course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        response = self.client.post(
            f"/api/courses/{single_course.id}/lessons/{single_lesson.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        single_assignment.refresh_from_db()
        self.assertEqual(single_assignment.progress_status, "completed")
        self.assertIsNotNone(single_assignment.started_at)
        self.assertIsNotNone(single_assignment.completed_at)

    def test_one_lesson_course_toggle_back_to_not_started(self):
        single_course = Course.objects.create(
            title="Single Lesson Course",
            description="One lesson only",
            status="published",
        )

        single_lesson = Lesson.objects.create(
            course=single_course,
            title="Only Lesson",
            objective="Only objective",
            order=1,
        )

        single_assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=single_course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        self.client.post(f"/api/courses/{single_course.id}/lessons/{single_lesson.id}/complete/")
        response = self.client.post(f"/api/courses/{single_course.id}/lessons/{single_lesson.id}/complete/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        single_assignment.refresh_from_db()
        self.assertEqual(single_assignment.progress_status, "not_started")
        self.assertIsNone(single_assignment.started_at)
        self.assertIsNone(single_assignment.completed_at)

    def test_unassigned_employee_cannot_complete_lesson(self):
        lesson_1 = Lesson.objects.create(
            course=self.course,
            title="Lesson 1",
            objective="Objective 1",
            order=1,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.other_employee_token}")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_complete_lesson(self):
        lesson_1 = Lesson.objects.create(
        course=self.course,
        title="Lesson 1",
        objective="Objective 1",
        order=1,
    )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

        response = self.client.post(
            f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_completed_lessons_are_returned_in_assigned_courses_endpoint(self):
        lesson_1 = Lesson.objects.create(
        course=self.course,
        title="Lesson 1",
        objective="Objective 1",
        order=1,
        )
        
        lesson_2 = Lesson.objects.create(
            course=self.course,
            title="Lesson 2",
            objective="Objective 2",
            order=2,
        )

        self.assignment = CourseAssignment.objects.create(
            employee=self.employee_user,
            course=self.course,
            progress_status="not_started",
            is_active=True,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.employee_token}")

        self.client.post(f"/api/courses/{self.course.id}/lessons/{lesson_1.id}/complete/")

        response = self.client.get("/api/employee/assigned-courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        course_data = response.data[0]
        self.assertEqual(course_data["course_id"], self.course.id)
        self.assertEqual(course_data["total_lessons"], 2)
        self.assertEqual(course_data["done_lessons"], 1)
        self.assertEqual(course_data["progress_percentage"], 50)
        self.assertEqual(course_data["progress_status"], "in_progress")