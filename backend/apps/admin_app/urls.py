from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardView, UsersView, CreateEmployeeView,
    EmployeeProfileView, EmployeeChangePasswordView,
    EmployeeListView, DeleteEmployeesView
)

router = DefaultRouter()

urlpatterns = [
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/employees/', CreateEmployeeView.as_view(), name='create-employee'),
    path('admin/employees/list/', EmployeeListView.as_view(), name='employee-list'),
    path('admin/employees/delete/', DeleteEmployeesView.as_view(), name='delete-employees'),
    path('employee/profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    path('employee/change-password/', EmployeeChangePasswordView.as_view(), name='employee-change-password'),
    # path('', include(router.urls)),
    path('users/', UsersView.as_view(), name='users'),
]