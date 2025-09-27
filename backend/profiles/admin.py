from django.contrib import admin
from .models import UserProfile, ProfilePicture


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_name', 'year', 'created_at')
    list_filter = ('year', 'theme', 'created_at')
    search_fields = ('user__university_email', 'preferred_name', 'full_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(ProfilePicture)
class ProfilePictureAdmin(admin.ModelAdmin):
    list_display = ('profile', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('profile__user__university_email', 'profile__preferred_name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

