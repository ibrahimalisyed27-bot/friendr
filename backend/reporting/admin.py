from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'reported_user', 'reporter', 'reason', 'status', 
        'created_at', 'resolved_at'
    )
    list_filter = ('reason', 'status', 'created_at')
    search_fields = (
        'reported_user__university_email', 
        'reporter__university_email',
        'description'
    )
    readonly_fields = ('created_at', 'updated_at', 'resolved_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Report Details', {
            'fields': ('reported_user', 'reporter', 'reason', 'description')
        }),
        ('Evidence', {
            'fields': ('proof_image', 'proof_text')
        }),
        ('Status', {
            'fields': ('status', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'reported_user', 'reporter'
        )

