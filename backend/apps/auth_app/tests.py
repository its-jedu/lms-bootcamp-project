from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class LogoutTests(TestCase):
    
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
    
    
    def test_authenticated_user_can_logout_with_valid_refresh_token(self):
        # Refresh token linked to access token of user
        refresh_token = str(RefreshToken.for_user(self.employee_user))

        self.client.cookies["refresh_token"] = refresh_token  
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.post('/api/auth/logout/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)


    def test_authenticated_user_cannot_logout_without_refresh_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.post('/api/auth/logout/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Refresh token is required')


    def test_authenticated_user_cannot_logout_with_invalid_refresh_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.employee_token}')
        response = self.client.post('/api/auth/logout/', {
            'refresh': 'invalid_token'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


    def test_unauthenticated_user_cannot_logout(self):
        refresh_token = str(RefreshToken.for_user(self.employee_user))

        response = self.client.post('/api/auth/logout/', {
            'refresh': refresh_token
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)