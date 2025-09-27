from django.db import models
from django.conf import settings
from accounts.models import User
from matching.models import Match


class Message(models.Model):
    """Message model for chat between matched users"""
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
    ]
    
    match = models.ForeignKey(
        Match, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()  # For text messages or image URLs
    image = models.ImageField(upload_to='message_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.university_email} in match {self.match.id}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class MessageReadStatus(models.Model):
    """Track read status of messages for each user"""
    message = models.ForeignKey(
        Message, 
        on_delete=models.CASCADE, 
        related_name='read_statuses'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='message_read_statuses'
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('message', 'user')
    
    def __str__(self):
        return f"Read status for {self.user.university_email} on message {self.message.id}"

