from django.contrib import admin
from .models import Swipe, Match, FullConnection


@admin.register(Swipe)
class SwipeAdmin(admin.ModelAdmin):
    list_display = ('swiper', 'swiped_user', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('swiper__university_email', 'swiped_user__university_email')
    ordering = ('-created_at',)


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'is_fully_connected', 'created_at')
    list_filter = ('is_fully_connected', 'created_at')
    search_fields = ('user1__university_email', 'user2__university_email')
    ordering = ('-created_at',)


@admin.register(FullConnection)
class FullConnectionAdmin(admin.ModelAdmin):
    list_display = ('match', 'user1_confirmed', 'user2_confirmed', 'completed_at', 'created_at')
    list_filter = ('user1_confirmed', 'user2_confirmed', 'created_at')
    search_fields = ('match__user1__university_email', 'match__user2__university_email')
    readonly_fields = ('completed_at', 'created_at')
    ordering = ('-created_at',)

