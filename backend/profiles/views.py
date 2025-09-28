from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import UserProfile, ProfilePicture
from .serializers import (
    UserProfileSerializer,
    UserProfileCreateSerializer,
    UserProfileUpdateSerializer,
    SwipeProfileSerializer,
    ProfilePictureSerializer,
    ProfilePictureUploadSerializer
)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserProfileSerializer
        return UserProfileUpdateSerializer
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_profile(request):
    """Create user profile (only if it doesn't exist)"""
    if hasattr(request.user, 'profile'):
        return Response({
            'error': 'Profile already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserProfileCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        profile = serializer.save()
        return Response(
            UserProfileSerializer(profile).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_swipe_profiles(request):
    """Get profiles for swiping (limited info)"""
    # Get current user's profile
    try:
        current_profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get profiles to show (same year, exclude current user)
    profiles = UserProfile.objects.filter(
        year=current_profile.year
    ).exclude(user=request.user)
    
    # TODO: Add logic to exclude already swiped profiles
    # This would require checking the Swipe model
    
    serializer = SwipeProfileSerializer(profiles, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    """Upload profile picture"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProfilePictureUploadSerializer(data=request.data)
    if serializer.is_valid():
        picture = serializer.save()
        return Response(
            ProfilePictureSerializer(picture).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_pictures(request):
    """Get user's profile pictures"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    pictures = profile.pictures.all()
    serializer = ProfilePictureSerializer(pictures, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_picture(request, picture_id):
    """Delete profile picture"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        picture = profile.pictures.get(id=picture_id)
        picture.delete()
        return Response({
            'message': 'Picture deleted successfully'
        }, status=status.HTTP_200_OK)
    except ProfilePicture.DoesNotExist:
        return Response({
            'error': 'Picture not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def set_primary_picture(request, picture_id):
    """Set primary profile picture"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        picture = profile.pictures.get(id=picture_id)
        picture.is_primary = True
        picture.save()
        return Response({
            'message': 'Primary picture updated successfully'
        }, status=status.HTTP_200_OK)
    except ProfilePicture.DoesNotExist:
        return Response({
            'error': 'Picture not found'
        }, status=status.HTTP_404_NOT_FOUND)

