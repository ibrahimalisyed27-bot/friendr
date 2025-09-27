from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from .models import Message, MessageReadStatus
# from matching.models import Match  # Will import later to avoid circular import
from .serializers import (
    MessageSerializer,
    MessageCreateSerializer,
    MessageReadStatusSerializer,
    ChatSummarySerializer
)


class MessageListCreateView(generics.ListCreateAPIView):
    """List and create messages for a specific match"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        """Get messages for the specific match"""
        from matching.models import Match
        match_id = self.kwargs['match_id']
        match = get_object_or_404(
            Match,
            id=match_id
        )
        # Check if user is part of the match
        if self.request.user not in [match.user1, match.user2]:
            from django.http import Http404
            raise Http404("Match not found")
        return Message.objects.filter(match=match)
    
    def perform_create(self, serializer):
        """Create message and update read status"""
        from matching.models import Match
        match_id = self.kwargs['match_id']
        match = get_object_or_404(
            Match,
            id=match_id
        )
        # Check if user is part of the match
        if self.request.user not in [match.user1, match.user2]:
            from django.http import Http404
            raise Http404("Match not found")
        serializer.save(match=match)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_list(request):
    """Get list of all chats (matches with last message)"""
    from matching.models import Match
    user = request.user
    
    # Get all matches for the user
    from django.db import models
    matches = Match.objects.filter(
        models.Q(user1=user) | models.Q(user2=user)
    ).order_by('-created_at')
    
    chat_summaries = []
    
    for match in matches:
        # Get other user
        other_user = match.get_other_user(user)
        
        # Get last message
        last_message = Message.objects.filter(match=match).last()
        
        # Count unread messages
        unread_count = MessageReadStatus.objects.filter(
            message__match=match,
            user=user,
            is_read=False
        ).count()
        
        chat_summary = {
            'match_id': match.id,
            'other_user': other_user,
            'other_user_name': other_user.profile.preferred_name if hasattr(other_user, 'profile') else other_user.university_email,
            'last_message': last_message,
            'unread_count': unread_count,
            'is_fully_connected': match.is_fully_connected
        }
        
        chat_summaries.append(chat_summary)
    
    serializer = ChatSummarySerializer(chat_summaries, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, match_id):
    """Mark all messages in a match as read for the current user"""
    from matching.models import Match
    try:
        from django.db import models
        match = Match.objects.get(
            models.Q(user1=request.user) | models.Q(user2=request.user),
            id=match_id
        )
    except Match.DoesNotExist:
        return Response({
            'error': 'Match not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Mark all messages in this match as read for current user
    MessageReadStatus.objects.filter(
        message__match=match,
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': 'Messages marked as read'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get total unread message count for the user"""
    unread_count = MessageReadStatus.objects.filter(
        user=request.user,
        is_read=False
    ).count()
    
    return Response({
        'unread_count': unread_count
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_text_message(request, match_id):
    """Send a text message"""
    from matching.models import Match
    try:
        from django.db import models
        match = Match.objects.get(
            models.Q(user1=request.user) | models.Q(user2=request.user),
            id=match_id
        )
    except Match.DoesNotExist:
        return Response({
            'error': 'Match not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = MessageCreateSerializer(
        data={
            'match': match.id,
            'message_type': 'text',
            'content': request.data.get('content')
        },
        context={'request': request}
    )
    
    if serializer.is_valid():
        message = serializer.save()
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_image_message(request, match_id):
    """Send an image message (only after full connection)"""
    from matching.models import Match
    try:
        from django.db import models
        match = Match.objects.get(
            models.Q(user1=request.user) | models.Q(user2=request.user),
            id=match_id
        )
    except Match.DoesNotExist:
        return Response({
            'error': 'Match not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not match.is_fully_connected:
        return Response({
            'error': 'You can only send images after fully connecting'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = MessageCreateSerializer(
        data={
            'match': match.id,
            'message_type': 'image',
            'content': request.data.get('content', ''),
            'image': request.FILES.get('image')
        },
        context={'request': request}
    )
    
    if serializer.is_valid():
        message = serializer.save()
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
