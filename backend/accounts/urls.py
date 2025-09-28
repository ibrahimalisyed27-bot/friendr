from django.urls import path
from . import views

urlpatterns = [
    path('universities/', views.UniversityListView.as_view(), name='universities'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('change-password/', views.change_password, name='change_password'),
    path('profile/', views.user_profile, name='user_profile'),
]