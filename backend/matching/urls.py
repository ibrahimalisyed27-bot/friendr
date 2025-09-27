from django.urls import path
from . import views

urlpatterns = [
    path('swipe/', views.swipe_user, name='swipe_user'),
    path('matches/', views.get_matches, name='get_matches'),
    path('matches/<int:match_id>/', views.get_match_detail, name='get_match_detail'),
    path('matches/<int:match_id>/fully-connect/', views.fully_connect, name='fully_connect'),
    path('swipe-history/', views.get_swipe_history, name='swipe_history'),
    path('swipeable-profiles/', views.get_swipeable_profiles, name='swipeable_profiles'),
]

