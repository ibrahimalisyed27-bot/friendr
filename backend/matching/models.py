from django.db import models
from django.conf import settings
from accounts.models import User
from profiles.models import UserProfile


class Swipe(models.Model):
    """Swipe model for tracking user swipes"""
    SWIPE_CHOICES = [
        ('skip', 'Skip'),
        ('wave', 'Wave'),
    ]
    
    swiper = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='swipes_made'
    )
    swiped_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='swipes_received'
    )
    action = models.CharField(max_length=10, choices=SWIPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('swiper', 'swiped_user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.swiper.university_email} {self.action} {self.swiped_user.university_email}"


class Match(models.Model):
    """Match model for when both users wave at each other"""
    user1 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='matches_as_user1'
    )
    user2 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='matches_as_user2'
    )
    is_fully_connected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    fully_connected_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user1', 'user2')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Match between {self.user1.university_email} and {self.user2.university_email}"
    
    def get_other_user(self, user):
        """Get the other user in the match"""
        if user == self.user1:
            return self.user2
        return self.user1
    
    def get_user1_profile(self):
        """Get user1's profile"""
        return self.user1.profile
    
    def get_user2_profile(self):
        """Get user2's profile"""
        return self.user2.profile


class FullConnection(models.Model):
    """Track when users fully connect (reveal all details)"""
    match = models.OneToOneField(
        Match, 
        on_delete=models.CASCADE, 
        related_name='full_connection'
    )
    user1_confirmed = models.BooleanField(default=False)
    user2_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Full connection for match {self.match.id}"
    
    def is_completed(self):
        """Check if both users have confirmed full connection"""
        return self.user1_confirmed and self.user2_confirmed
    
    def save(self, *args, **kwargs):
        # If both users confirmed, update the match
        if self.is_completed() and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
            self.match.is_fully_connected = True
            self.match.fully_connected_at = timezone.now()
            self.match.save()
        super().save(*args, **kwargs)

