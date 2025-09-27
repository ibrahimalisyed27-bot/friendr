from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Report
from .serializers import (
    ReportSerializer,
    ReportCreateSerializer,
    ReportUpdateSerializer
)


class ReportCreateView(generics.CreateAPIView):
    """Create a new report"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReportCreateSerializer
    
    def perform_create(self, serializer):
        serializer.save()


class ReportListView(generics.ListAPIView):
    """List user's reports"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    
    def get_queryset(self):
        """Get reports made by the current user"""
        return Report.objects.filter(reporter=self.request.user)


class ReportDetailView(generics.RetrieveAPIView):
    """Get report details"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    
    def get_queryset(self):
        """Get reports made by the current user"""
        return Report.objects.filter(reporter=self.request.user)


# Admin views
class AdminReportListView(generics.ListAPIView):
    """List all reports (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReportSerializer
    queryset = Report.objects.all()


class AdminReportDetailView(generics.RetrieveUpdateAPIView):
    """Get and update report details (admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReportUpdateSerializer
    queryset = Report.objects.all()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_report_stats(request):
    """Get reporting statistics (admin only)"""
    total_reports = Report.objects.count()
    pending_reports = Report.objects.filter(status='pending').count()
    under_review_reports = Report.objects.filter(status='under_review').count()
    resolved_reports = Report.objects.filter(status='resolved').count()
    dismissed_reports = Report.objects.filter(status='dismissed').count()
    
    # Reports by reason
    reason_stats = {}
    for reason, _ in Report.REASON_CHOICES:
        reason_stats[reason] = Report.objects.filter(reason=reason).count()
    
    return Response({
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'under_review_reports': under_review_reports,
        'resolved_reports': resolved_reports,
        'dismissed_reports': dismissed_reports,
        'reason_stats': reason_stats
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_reports(request):
    """Bulk update report status (admin only)"""
    report_ids = request.data.get('report_ids', [])
    new_status = request.data.get('status')
    admin_notes = request.data.get('admin_notes', '')
    
    if not report_ids or not new_status:
        return Response({
            'error': 'report_ids and status are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_status not in [choice[0] for choice in Report.STATUS_CHOICES]:
        return Response({
            'error': 'Invalid status'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    reports = Report.objects.filter(id__in=report_ids)
    updated_count = 0
    
    for report in reports:
        report.status = new_status
        if admin_notes:
            report.admin_notes = admin_notes
        if new_status == 'resolved' and report.status != 'resolved':
            from django.utils import timezone
            report.resolved_at = timezone.now()
        report.save()
        updated_count += 1
    
    return Response({
        'message': f'Updated {updated_count} reports',
        'updated_count': updated_count
    })

