from django.db import models
from django.conf import settings
from accounts.models import User


class UserProfile(models.Model):
    """User profile model with all required fields"""
    YEAR_CHOICES = [
        ('freshman', 'Freshman'),
        ('sophomore', 'Sophomore'),
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('master', 'Master'),
        ('phd', 'PhD'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        primary_key=True
    )
    full_name = models.CharField(max_length=100)
    preferred_name = models.CharField(max_length=50)
    year = models.CharField(max_length=20, choices=YEAR_CHOICES)
    hobbies = models.TextField()
    interests = models.TextField()
    summary = models.TextField(blank=True, null=True)
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.preferred_name}'s Profile"
    
    def get_ai_summary(self):
        """Generate AI summary by combining summary, hobbies, and interests"""
        parts = []
        if self.summary:
            parts.append(self.summary)
        if self.hobbies:
            parts.append(f"Hobbies: {self.hobbies}")
        if self.interests:
            parts.append(f"Interests: {self.interests}")
        
        return " | ".join(parts) if parts else "No summary available"


class ProfilePicture(models.Model):
    """Profile pictures model"""
    profile = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='pictures'
    )
    image = models.ImageField(upload_to='profile_pictures/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Picture for {self.profile.preferred_name}"
    
    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primary pictures
        if self.is_primary:
            ProfilePicture.objects.filter(
                profile=self.profile, 
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)

