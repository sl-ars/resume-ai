from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from companies.models import Company
from users.models import User

class CompanyAPITests(APITestCase):
    def setUp(self):
        # Create a recruiter user
        self.recruiter = User.objects.create_user(
            email='recruiter@example.com',
            password='password123',
            role='recruiter',
            is_email_verified=True
        )
        
        # Create a non-recruiter user
        self.job_seeker = User.objects.create_user(
            email='jobseeker@example.com',
            password='password123',
            role='job_seeker',
            is_email_verified=True
        )
        
        # Create a company for the recruiter
        self.company = Company.objects.create(
            name='Test Company',
            description='A company for testing',
            website='https://testcompany.com'
        )
        self.company.recruiters.add(self.recruiter)
        
        # Setup API client
        self.client = APIClient()
    
    def test_my_company_endpoint_as_recruiter(self):
        """Test that a recruiter can access their company details"""
        # Authenticate as recruiter
        self.client.force_authenticate(user=self.recruiter)
        
        # Make request to my-company endpoint
        url = reverse('company-my-company')
        response = self.client.get(url)
        
        # Check response status and content
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Company')
        self.assertEqual(response.data['description'], 'A company for testing')
        self.assertEqual(response.data['website'], 'https://testcompany.com')
        self.assertEqual(len(response.data['recruiters']), 1)
        self.assertEqual(response.data['recruiters'][0]['email'], self.recruiter.email)
    
    def test_my_company_endpoint_as_job_seeker(self):
        """Test that a job seeker cannot access the my-company endpoint"""
        # Authenticate as job seeker
        self.client.force_authenticate(user=self.job_seeker)
        
        # Make request to my-company endpoint
        url = reverse('company-my-company')
        response = self.client.get(url)
        
        # Check response status is forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_my_company_endpoint_unauthenticated(self):
        """Test that an unauthenticated user cannot access the my-company endpoint"""
        # Make request to my-company endpoint without authentication
        url = reverse('company-my-company')
        response = self.client.get(url)
        
        # Check response status is unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_my_company_endpoint_recruiter_without_company(self):
        """Test the response when a recruiter doesn't have a company"""
        # Create a new recruiter without a company
        recruiter_without_company = User.objects.create_user(
            email='recruiter2@example.com',
            password='password123',
            role='recruiter',
            is_email_verified=True
        )
        
        # Authenticate as the new recruiter
        self.client.force_authenticate(user=recruiter_without_company)
        
        # Make request to my-company endpoint
        url = reverse('company-my-company')
        response = self.client.get(url)
        
        # Check response status is not found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
