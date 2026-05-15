from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.admin_app.permissions import IsAdmin
from apps.courses_app.models import Course, CourseAssignment, Lesson, LessonProgress
from apps.courses_app.serializers.lessons import LessonSerializer


class LessonViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ["create", "partial_update", "reorder", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def _get_viewable_course(self, request, course_id):
        if request.user.role == "admin":
            return get_object_or_404(Course, pk=course_id)
        
        course = get_object_or_404(Course, pk=course_id, status="published")

        if not CourseAssignment.objects.filter(
            employee=request.user,
            course=course,
            is_active=True,
        ).exists():
            raise PermissionDenied("You do not have permission to view lessons for this course.")
        
        return course
    
    def _ordered_lessons(self, course):
        return course.lessons.order_by("order", "created_at", "id")
    
    def _mark_course_assignment_in_progress(self, employee, course):
        assignment = CourseAssignment.objects.filter(
            employee=employee,
            course=course,
            is_active=True
        ).first()

        if not assignment:
            return

        if assignment.progress_status == "not_started":
            assignment.progress_status = "in_progress"
            assignment.started_at = timezone.now()
            assignment.completed_at = None
            assignment.save(update_fields=["progress_status", "started_at", "completed_at", "updated_at"])


    def _sync_course_assignment_completion(self, employee, course):
        assignment = CourseAssignment.objects.filter(
            employee=employee,
            course=course,
            is_active=True
        ).first()

        if not assignment:
            return

        total_lessons = Lesson.objects.filter(course=course).count()

        done_lessons = LessonProgress.objects.filter(
        employee=employee,
        lesson__course=course,
        status="done",
    ).count()

        if done_lessons == total_lessons:
            if not assignment.started_at:
                assignment.started_at = timezone.now()
            assignment.progress_status = "completed"
            assignment.completed_at = timezone.now()
            assignment.save(update_fields=["progress_status", "started_at", "completed_at", "updated_at"])
            return

        if done_lessons > 0:
            assignment.progress_status = "in_progress"
            if not assignment.started_at:
                assignment.started_at = timezone.now()
            assignment.completed_at = None
            assignment.save(update_fields=["progress_status", "started_at", "completed_at", "updated_at"])
            return

        assignment.progress_status = "not_started"
        assignment.started_at = None
        assignment.completed_at = None
        assignment.save(update_fields=["progress_status", "started_at", "completed_at", "updated_at"])


    # Published courses are view only, including lesson changes
    def _ensure_draft_course(self, course):
        if course.status == "published":
            return Response(
                {"error": "Published courses are view only."},
                status=status.HTTP_409_CONFLICT,
            )
        return None
    
    def list(self, request, course_id=None):
        course = self._get_viewable_course(request, course_id)
        serializer = LessonSerializer(
            self._ordered_lessons(course),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)
    
    def retrieve(self, request, course_id=None, pk=None):
        course = self._get_viewable_course(request, course_id)
        lesson = get_object_or_404(Lesson, pk=pk, course=course)

        lessons = list(self._ordered_lessons(course))
        current_index = [item.id for item in lessons].index(lesson.id)

        previous_lesson = lessons[current_index - 1] if current_index > 0 else None
        next_lesson = lessons[current_index + 1] if current_index < len(lessons) - 1 else None

        lesson_data = LessonSerializer(lesson, context={"request": request},).data
        lesson_data.update(
            {
                "previous_lesson": None if previous_lesson is None else {
                    "id": previous_lesson.id,
                    "title": previous_lesson.title,
                    "order": previous_lesson.order,
                },
                "next_lesson": None if next_lesson is None else {
                    "id": next_lesson.id,
                    "title": next_lesson.title,
                    "order": next_lesson.order,
                },
                "can_go_previous": previous_lesson is not None,
                "can_go_next": next_lesson is not None,
            }
        )
        return Response(lesson_data)
    
    def create(self, request, course_id=None):
        course = get_object_or_404(Course, pk=course_id)

        locked_response = self._ensure_draft_course(course)
        if locked_response:
            return locked_response

        serializer = LessonSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        serializer.save(course=course, order=course.lessons.count() + 1)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, course_id=None, pk=None):
        course = get_object_or_404(Course, pk=course_id)

        locked_response = self._ensure_draft_course(course)
        if locked_response:
            return locked_response

        lesson = get_object_or_404(Lesson, pk=pk, course=course)

        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        serializer.save()
        return Response(serializer.data)

    def reorder(self, request, course_id=None):
        course = get_object_or_404(Course, pk=course_id)
        
        locked_response = self._ensure_draft_course(course)
        if locked_response:
            return locked_response

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

        locked_response = self._ensure_draft_course(course)
        if locked_response:
            return locked_response

        lesson = get_object_or_404(Lesson, pk=pk, course=course)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def complete(self, request, course_id=None, pk=None):
        course = self._get_viewable_course(request, course_id)

        if request.user.role != "employee":
            return Response(
                {"error": "Only employees can update lesson completion."},
                status=status.HTTP_403_FORBIDDEN,
            )

        lesson = get_object_or_404(Lesson, pk=pk, course=course)

        assignment = CourseAssignment.objects.filter(
            employee=request.user,
            course=course,
            is_active=True,
        ).first()

        if not assignment:
            raise PermissionDenied("You do not have permission to update lessons for this course.")

        progress, _ = LessonProgress.objects.get_or_create(
            employee=request.user,
            lesson=lesson,
            defaults={
                "status": "not_done",
                "completed_at": None,
            },
        )

        if progress.status == "done":
            progress.status = "not_done"
            progress.completed_at = None
            progress.save(update_fields=["status", "completed_at", "updated_at"])
            lesson_completed = False
        else:
            progress.status = "done"
            progress.completed_at = timezone.now()
            progress.save(update_fields=["status", "completed_at", "updated_at"])
            lesson_completed = True

        self._sync_course_assignment_completion(request.user, course)

        return Response(
            {
                "message": "Lesson completion updated successfully.",
                "lesson_id": lesson.id,
                "status": progress.status,
                "completed": lesson_completed,
            },
            status=status.HTTP_200_OK,
        )