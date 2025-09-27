from django.urls import path
from . import views

urlpatterns = [
    path('chats/', views.get_chat_list, name='chat_list'),
    path('chats/<int:match_id>/messages/', views.MessageListCreateView.as_view(), name='match_messages'),
    path('chats/<int:match_id>/mark-read/', views.mark_messages_read, name='mark_messages_read'),
    path('unread-count/', views.get_unread_count, name='unread_count'),
    path('chats/<int:match_id>/send-text/', views.send_text_message, name='send_text_message'),
    path('chats/<int:match_id>/send-image/', views.send_image_message, name='send_image_message'),
]

