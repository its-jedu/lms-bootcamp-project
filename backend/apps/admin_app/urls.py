from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardView, UsersView, CreateEmployeeView,
    EmployeeProfileView, EmployeeChangePasswordView,
    EmployeeListView, DeleteEmployeesView
)
from apps.courses_app.views import CourseAssignmentViewSet

router = DefaultRouter()

# Course assignment views
course_assignments = CourseAssignmentViewSet.as_view({
    "get": "list",
    "post": "create",
})

urlpatterns = [
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/employees/', CreateEmployeeView.as_view(), name='create-employee'),
    path('admin/employees/list/', EmployeeListView.as_view(), name='employee-list'),
    path('admin/employees/delete/', DeleteEmployeesView.as_view(), name='delete-employees'),
    path('admin/course-assignments/', course_assignments, name='course-assignments'),
    path('employee/profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    path('employee/change-password/', EmployeeChangePasswordView.as_view(), name='employee-change-password'),
    path('users/', UsersView.as_view(), name='users'),
]