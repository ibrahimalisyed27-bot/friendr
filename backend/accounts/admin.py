from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification, University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'domain', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'domain')
    ordering = ('name',)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('university_email', 'university', 'is_verified', 'is_active', 'created_at')
    list_filter = ('is_verified', 'is_active', 'university', 'created_at')
    search_fields = ('university_email', 'university__name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('university_email', 'password')}),
        ('University Info', {'fields': ('university',)}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('university_email', 'university', 'password1', 'password2'),
        }),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_code', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__university_email', 'otp_code')
    readonly_fields = ('otp_code', 'created_at')
    ordering = ('-created_at',)