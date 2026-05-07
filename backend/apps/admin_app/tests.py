from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.auth_app.models import User
from apps.courses_app.models import Course

class AdminAccessTests(TestCase):
    
    def setUp(self):
        
        self.client = APIClient()
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            role='admin'
        )
        
        # Create employee user
        self.employee_user = User.objects.create_user(
            email='employee@example.com',
            password='employeepass123',
            role='employee'
        )
        
        # Generate tokens
        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.employee_token = str(RefreshToken.for_user(self.employee_user).access_token)
    
    def test_admin_can_access_dashboard(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

        Course.objects.create(title='Course 1', description='First course', status='draft')
        Course.objects.create(title='Course 2', description='Second course', status='published')

        response = self.client.get('/api/admin/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_courses'], 2)
        self.assertEqual(response.data['total_employees'], 1)
        self.assertEqual(response.data['total_assignments'], 0)
    
    def test_employee_cannot_access_dashboard(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.get('/api/admin/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_create_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        self.assertEqual(Course.objects.count(), 0)
        response = self.client.post('/api/courses/', {
            'title': 'Test Course',
            'description': 'This is a test course'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Course')
        self.assertEqual(response.data['status'], 'draft')
        self.assertEqual(Course.objects.count(), 1)

        course = Course.objects.get()
        self.assertEqual(course.title, 'Test Course')
        self.assertEqual(course.description, 'This is a test course')
        self.assertEqual(course.status, 'draft')
    
    def test_admin_cannot_create_course_without_title(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.post('/api/courses/', {
            'description': 'No title provided'
        })
        
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    def test_employee_cannot_create_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.post('/api/courses/', {
            'title': 'Test Course'
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_list_employees(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))
    
    def test_employee_cannot_list_employees(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_access_denied(self):
        response = self.client.get('/api/admin/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/api/courses/', {'title': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_admin_can_list_courses(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

        Course.objects.create(
            title='Course 1',
            description='First course',
            status='draft'
        )
        
        # Then list courses
        response = self.client.get('/api/courses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Course 1')
        self.assertEqual(response.data[0]['status'], 'draft')
