from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, LessonViewSet, MaterialViewSet, CourseAssignmentViewSet
 
router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")

lesson_list = LessonViewSet.as_view(
    {
        "get": "list",
        "post": "create",
    }
)

lesson_detail = LessonViewSet.as_view(
    {
        "get": "retrieve",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

lesson_reorder = LessonViewSet.as_view(
    {
        "patch": "reorder"
    }
)

lesson_materials = MaterialViewSet.as_view({
    "get": "list",
})

lesson_material_file = MaterialViewSet.as_view({
    "post": "create_file",
})

lesson_material_text = MaterialViewSet.as_view({
    "post": "create_text",
})

lesson_material_video = MaterialViewSet.as_view({
    "post": "create_video",
})

lesson_material_delete = MaterialViewSet.as_view({
    "delete": "destroy",
})

course_assignments = CourseAssignmentViewSet.as_view({
    "get": "list",
    "post": "create",
})

employee_assigned_courses = CourseAssignmentViewSet.as_view({
    "get": "my_courses",
})

urlpatterns = [
    path("", include(router.urls)),
    path("courses/<int:course_id>/lessons/",lesson_list,name="course-lessons",),
    path("courses/<int:course_id>/lessons/reorder/",lesson_reorder,name="course-lessons-reorder",),
    path("courses/<int:course_id>/lessons/<int:pk>/",lesson_detail, name="course-lesson-detail",),
    
    path("lessons/<int:lesson_id>/materials/", lesson_materials, name="material-list"),
    path("lessons/<int:lesson_id>/materials/file/", lesson_material_file, name="material-create-file"),
    path("lessons/<int:lesson_id>/materials/text/", lesson_material_text, name="material-create-text"),
    path("lessons/<int:lesson_id>/materials/video/", lesson_material_video, name="material-create-video"),
    path("lessons/<int:lesson_id>/materials/<int:pk>/", lesson_material_delete, name="material-detail"),    
    
    # To keep the same style as "/admin/dashboard/" for admin routing
    path("admin/course-assignments/", course_assignments, name="course-assignments"),
    # MUST be moved to admin_app
    path("employee/assigned-courses/", employee_assigned_courses, name="employee-assigned-courses"), 
]