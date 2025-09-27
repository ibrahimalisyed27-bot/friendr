from rest_framework import serializers
from .models import Message, MessageReadStatus
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender = UserSerializer(read_only=True)
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = (
            'id', 'match', 'sender', 'sender_name', 'message_type', 
            'content', 'image', 'created_at', 'is_read', 'read_at'
        )
        read_only_fields = ('id', 'created_at', 'is_read', 'read_at')
    
    def get_sender_name(self, obj):
        """Get sender's preferred name"""
        try:
            return obj.sender.profile.preferred_name
        except:
            return obj.sender.university_email


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    class Meta:
        model = Message
        fields = ('match', 'message_type', 'content', 'image')
    
    def validate(self, attrs):
        """Validate message based on match status"""
        match = attrs['match']
        message_type = attrs['message_type']
        
        # Check if user is part of the match
        if self.context['request'].user not in [match.user1, match.user2]:
            raise serializers.ValidationError("You are not part of this match")
        
        # Check if match is fully connected for image messages
        if message_type == 'image' and not match.is_fully_connected:
            raise serializers.ValidationError("You can only send images after fully connecting")
        
        return attrs
    
    def create(self, validated_data):
        """Create message"""
        validated_data['sender'] = self.context['request'].user
        message = Message.objects.create(**validated_data)
        
        # Create read status for both users
        match = validated_data['match']
        for user in [match.user1, match.user2]:
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=user,
                defaults={'is_read': user == validated_data['sender']}
            )
        
        return message


class MessageReadStatusSerializer(serializers.ModelSerializer):
    """Serializer for message read status"""
    class Meta:
        model = MessageReadStatus
        fields = ('user', 'is_read', 'read_at')
        read_only_fields = ('read_at',)


class ChatSummarySerializer(serializers.Serializer):
    """Serializer for chat summary (match + last message)"""
    match_id = serializers.IntegerField()
    other_user = UserSerializer()
    other_user_name = serializers.CharField()
    last_message = MessageSerializer()
    unread_count = serializers.IntegerField()
    is_fully_connected = serializers.BooleanField()

