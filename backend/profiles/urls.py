from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserProfileView.as_view(), name='profile'),
    path('create/', views.create_profile, name='create_profile'),
    path('swipe-profiles/', views.get_swipe_profiles, name='swipe_profiles'),
    path('pictures/', views.get_profile_pictures, name='profile_pictures'),
    path('pictures/upload/', views.upload_profile_picture, name='upload_picture'),
    path('pictures/<int:picture_id>/delete/', views.delete_profile_picture, name='delete_picture'),
    path('pictures/<int:picture_id>/set-primary/', views.set_primary_picture, name='set_primary_picture'),
]

