from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReportCreateView.as_view(), name='create_report'),
    path('my-reports/', views.ReportListView.as_view(), name='my_reports'),
    path('my-reports/<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    
    # Admin endpoints
    path('admin/all/', views.AdminReportListView.as_view(), name='admin_all_reports'),
    path('admin/<int:pk>/', views.AdminReportDetailView.as_view(), name='admin_report_detail'),
    path('admin/stats/', views.get_report_stats, name='admin_report_stats'),
    path('admin/bulk-update/', views.bulk_update_reports, name='admin_bulk_update'),
]

