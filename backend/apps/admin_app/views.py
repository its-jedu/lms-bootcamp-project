from django.db import transaction
from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin
from .serializers import (
    EmployeeProfileSerializer, DashboardSerializer, 
    CreateEmployeeSerializer, UpdateProfileSerializer, ChangePasswordSerializer,
    EmployeeListSerializer, EmployeeDeleteSerializer
)
from apps.auth_app.models import User
from apps.courses_app.models import Course
import secrets
import string

def generate_random_password(length=8):
    """Generate random password with letters, numbers, and special characters"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        data = {
            'total_courses': Course.objects.count(),
            'total_employees': User.objects.filter(role='employee').count(),
            'total_assignments': 0
        }
        serializer = DashboardSerializer(data)
        return Response(serializer.data)

class UsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        employees = User.objects.filter(role='employee')
        serializer = EmployeeProfileSerializer(employees, many=True)
        return Response(serializer.data)

class CreateEmployeeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        
        validated_data = serializer.validated_data
        
        # Split full name into first and last name
        name_parts = validated_data['name'].strip().split()
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:])
        
        # Always generate auto password
        generated_password = generate_random_password()
        
        # Create employee user with full profile
        user = User.objects.create_user(
            email=validated_data['email'],
            password=generated_password,
            role='employee',
            first_name=first_name,
            last_name=last_name,
            phone_number='',
            position=''
        )
        
        return Response({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'role': user.role,
            'generated_password': generated_password,
            'message': f'Employee created successfully. Password is: {generated_password}'
        }, status=status.HTTP_201_CREATED)

class EmployeeProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current employee's profile"""
        if request.user.role != 'employee':
            return Response(
                {'error': 'Only employees can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EmployeeProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update employee's own profile"""
        if request.user.role != 'employee':
            return Response(
                {'error': 'Only employees can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UpdateProfileSerializer(data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        user = request.user
        for field, value in serializer.validated_data.items():
            if value:
                setattr(user, field, value)
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'profile': EmployeeProfileSerializer(user).data
        })
    
    def patch(self, request):
        """Partial update employee's profile"""
        return self.put(request)

class EmployeeChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Employee changes their own password"""
        if request.user.role != 'employee':
            return Response(
                {'error': 'Only employees can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ChangePasswordSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        # Check current password
        if not request.user.check_password(serializer.validated_data['current_password']):
            return Response(
                {'current_password': ['Wrong password']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'message': 'Password changed successfully'})

class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        employees = User.objects.filter(role="employee").order_by("-created_at")
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteEmployeesView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    parser_classes = [JSONParser]

    def delete(self, request):
        serializer = EmployeeDeleteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        employee_ids = serializer.validated_data["employee_ids"]

        employees = User.objects.filter(id__in=employee_ids, role="employee")
        found_employee_ids = set(employees.values_list("id", flat=True))
        requested_employee_ids = set(employee_ids)

        not_found_or_not_employee_ids = sorted(list(requested_employee_ids - found_employee_ids))
        
        if not_found_or_not_employee_ids:
            return Response(
                {"error": "One or more employee IDs do not exist. Please enter valid employee IDs."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_employee_ids = sorted(list(found_employee_ids))

        with transaction.atomic():
            employees.delete()

        return Response(
            {
                "message": "Employee deletion processed.",
                "deleted_employee_ids": deleted_employee_ids,
                "deleted_count": len(deleted_employee_ids),
            },
            status=status.HTTP_200_OK
        )