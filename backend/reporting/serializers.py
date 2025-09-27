from rest_framework import serializers
from .models import Report
from accounts.serializers import UserSerializer


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for reports"""
    reported_user = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = (
            'id', 'reported_user', 'reporter', 'reason', 'description',
            'proof_image', 'proof_text', 'status', 'admin_notes',
            'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = (
            'id', 'reporter', 'status', 'admin_notes', 
            'created_at', 'updated_at', 'resolved_at'
        )


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    class Meta:
        model = Report
        fields = (
            'reported_user', 'reason', 'description', 
            'proof_image', 'proof_text'
        )
    
    def validate_reported_user(self, value):
        """Validate that user can't report themselves"""
        if value == self.context['request'].user:
            raise serializers.ValidationError("You cannot report yourself")
        return value
    
    def create(self, validated_data):
        """Create report and send admin notification"""
        validated_data['reporter'] = self.context['request'].user
        report = Report.objects.create(**validated_data)
        
        # Send email notification to admin
        report.send_admin_notification()
        
        return report


class ReportUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating report status (admin only)"""
    class Meta:
        model = Report
        fields = ('status', 'admin_notes')
    
    def update(self, instance, validated_data):
        """Update report and set resolved_at if status is resolved"""
        if validated_data.get('status') == 'resolved' and instance.status != 'resolved':
            from django.utils import timezone
            validated_data['resolved_at'] = timezone.now()
        
        return super().update(instance, validated_data)

