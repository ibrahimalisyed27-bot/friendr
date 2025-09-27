from django.contrib import admin
from .models import Message, MessageReadStatus


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'match', 'message_type', 'created_at', 'is_read')
    list_filter = ('message_type', 'is_read', 'created_at')
    search_fields = ('sender__university_email', 'content')
    readonly_fields = ('created_at', 'read_at')
    ordering = ('-created_at',)


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'read_at')
    list_filter = ('is_read', 'read_at')
    search_fields = ('user__university_email', 'message__content')
    readonly_fields = ('read_at',)
    ordering = ('-message__created_at',)

