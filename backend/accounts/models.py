from django.contrib.auth.models import AbstractUser
from django.db import models
import random
import string
from django.utils import timezone
from datetime import timedelta


class University(models.Model):
    """University model for university selection"""
    name = models.CharField(max_length=200, unique=True)
    domain = models.CharField(max_length=100, unique=True)  # e.g., "asu.edu"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom User model with university email authentication"""
    university_email = models.EmailField(unique=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='users')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'university_email'
    REQUIRED_FIELDS = ['university']
    
    def __str__(self):
        return self.university_email


class OTPVerification(models.Model):
    """OTP verification for email verification"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.otp_code:
            self.otp_code = self.generate_otp()
        super().save(*args, **kwargs)
    
    def generate_otp(self):
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        """Check if OTP is expired (10 minutes)"""
        from django.conf import settings
        expiry_time = self.created_at + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
        return timezone.now() > expiry_time
    
    def __str__(self):
        return f"OTP for {self.user.university_email}: {self.otp_code}"