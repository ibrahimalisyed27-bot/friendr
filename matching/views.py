from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Swipe, Match, FullConnection
from .serializers import (
    SwipeSerializer,
    SwipeCreateSerializer,
    MatchSerializer,
    FullConnectionSerializer
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def swipe_user(request):
    """Swipe on a user (skip or wave)"""
    serializer = SwipeCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        swipe = serializer.save()
        return Response(
            SwipeSerializer(swipe).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches(request):
    """Get user's matches"""
    user = request.user
    
    # Get matches where user is either user1 or user2
    matches = Match.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).order_by('-created_at')
    
    serializer = MatchSerializer(matches, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_detail(request, match_id):
    """Get detailed information about a specific match"""
    try:
        match = Match.objects.get(
            Q(user1=request.user) | Q(user2=request.user),
            id=match_id
        )
    except Match.DoesNotExist:
        return Response({
            'error': 'Match not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = MatchSerializer(match, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fully_connect(request, match_id):
    """Confirm full connection with a match"""
    try:
        match = Match.objects.get(
            Q(user1=request.user) | Q(user2=request.user),
            id=match_id
        )
    except Match.DoesNotExist:
        return Response({
            'error': 'Match not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if match.is_fully_connected:
        return Response({
            'error': 'Already fully connected'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = FullConnectionSerializer(
        data={'match': match.id},
        context={'request': request}
    )
    
    if serializer.is_valid():
        full_connection = serializer.save()
        
        if full_connection.is_completed():
            return Response({
                'message': 'Full connection completed! You can now see all details and send pictures.',
                'match': MatchSerializer(match, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Your confirmation has been recorded. Waiting for the other user to confirm.',
                'match': MatchSerializer(match, context={'request': request}).data
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_swipe_history(request):
    """Get user's swipe history"""
    swipes = Swipe.objects.filter(swiper=request.user).order_by('-created_at')
    serializer = SwipeSerializer(swipes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_swipeable_profiles(request):
    """Get profiles that can be swiped on"""
    from profiles.models import UserProfile
    
    try:
        current_profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please create your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get users already swiped by current user
    swiped_user_ids = Swipe.objects.filter(swiper=request.user).values_list('swiped_user_id', flat=True)
    
    # Get profiles of same year, excluding current user and already swiped users
    profiles = UserProfile.objects.filter(
        year=current_profile.year
    ).exclude(
        user__in=[request.user.id] + list(swiped_user_ids)
    )
    
    from profiles.serializers import SwipeProfileSerializer
    serializer = SwipeProfileSerializer(profiles, many=True)
    return Response(serializer.data)

