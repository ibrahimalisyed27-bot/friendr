from django.db import models
from django.conf import settings
from accounts.models import User


class Report(models.Model):
    """Report model for user reports"""
    REASON_CHOICES = [
        ('inappropriate_content', 'Inappropriate Content'),
        ('harassment', 'Harassment'),
        ('spam', 'Spam'),
        ('fake_profile', 'Fake Profile'),
        ('inappropriate_behavior', 'Inappropriate Behavior'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reported_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reports_received'
    )
    reporter = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reports_made'
    )
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    description = models.TextField(help_text="Additional details about the report")
    proof_image = models.ImageField(
        upload_to='report_proofs/', 
        null=True, 
        blank=True,
        help_text="Screenshot or image evidence"
    )
    proof_text = models.TextField(
        blank=True, 
        null=True,
        help_text="Text evidence or additional context"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report of {self.reported_user.university_email} by {self.reporter.university_email}"
    
    def send_admin_notification(self):
        """Send email notification to admin about the report"""
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = f'New User Report - {self.get_reason_display()}'
        message = f"""
        A new report has been submitted:
        
        Reported User: {self.reported_user.university_email}
        Reporter: {self.reporter.university_email}
        Reason: {self.get_reason_display()}
        Description: {self.description}
        
        Proof Text: {self.proof_text or 'None provided'}
        Proof Image: {'Attached' if self.proof_image else 'None provided'}
        
        Report ID: {self.id}
        Created: {self.created_at}
        
        Please review this report in the admin panel.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            fail_silently=False,
        )

