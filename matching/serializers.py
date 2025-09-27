from rest_framework import serializers
from .models import Swipe, Match, FullConnection
from profiles.serializers import UserProfileSerializer, SwipeProfileSerializer
from accounts.serializers import UserSerializer


class SwipeSerializer(serializers.ModelSerializer):
    """Serializer for swipes"""
    swiped_user_profile = SwipeProfileSerializer(source='swiped_user.profile', read_only=True)
    
    class Meta:
        model = Swipe
        fields = ('id', 'swiped_user', 'swiped_user_profile', 'action', 'created_at')
        read_only_fields = ('id', 'created_at')


class SwipeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating swipes"""
    class Meta:
        model = Swipe
        fields = ('swiped_user', 'action')
    
    def validate_swiped_user(self, value):
        """Validate that user can't swipe on themselves"""
        if value == self.context['request'].user:
            raise serializers.ValidationError("You cannot swipe on yourself")
        return value
    
    def create(self, validated_data):
        """Create swipe and check for match"""
        swiper = self.context['request'].user
        swiped_user = validated_data['swiped_user']
        action = validated_data['action']
        
        # Create or update swipe
        swipe, created = Swipe.objects.get_or_create(
            swiper=swiper,
            swiped_user=swiped_user,
            defaults={'action': action}
        )
        
        if not created:
            swipe.action = action
            swipe.save()
        
        # Check for mutual wave (match)
        if action == 'wave':
            try:
                reverse_swipe = Swipe.objects.get(
                    swiper=swiped_user,
                    swiped_user=swiper,
                    action='wave'
                )
                # Create match if it doesn't exist
                Match.objects.get_or_create(
                    user1=min(swiper, swiped_user, key=lambda u: u.id),
                    user2=max(swiper, swiped_user, key=lambda u: u.id)
                )
            except Swipe.DoesNotExist:
                pass  # No mutual wave yet
        
        return swipe


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for matches"""
    other_user = serializers.SerializerMethodField()
    other_user_profile = serializers.SerializerMethodField()
    user1_profile = UserProfileSerializer(source='get_user1_profile', read_only=True)
    user2_profile = UserProfileSerializer(source='get_user2_profile', read_only=True)
    
    class Meta:
        model = Match
        fields = (
            'id', 'user1', 'user2', 'other_user', 'other_user_profile',
            'user1_profile', 'user2_profile', 'is_fully_connected',
            'created_at', 'fully_connected_at'
        )
        read_only_fields = ('id', 'created_at', 'fully_connected_at')
    
    def get_other_user(self, obj):
        """Get the other user in the match"""
        request_user = self.context['request'].user
        other_user = obj.get_other_user(request_user)
        return UserSerializer(other_user).data
    
    def get_other_user_profile(self, obj):
        """Get the other user's profile"""
        request_user = self.context['request'].user
        other_user = obj.get_other_user(request_user)
        try:
            return UserProfileSerializer(other_user.profile).data
        except:
            return None


class FullConnectionSerializer(serializers.ModelSerializer):
    """Serializer for full connections"""
    match = MatchSerializer(read_only=True)
    
    class Meta:
        model = FullConnection
        fields = (
            'id', 'match', 'user1_confirmed', 'user2_confirmed',
            'created_at', 'completed_at'
        )
        read_only_fields = ('id', 'created_at', 'completed_at')
    
    def create(self, validated_data):
        """Create or update full connection"""
        match = validated_data['match']
        user = self.context['request'].user
        
        # Get or create full connection
        full_connection, created = FullConnection.objects.get_or_create(
            match=match,
            defaults={
                'user1_confirmed': False,
                'user2_confirmed': False
            }
        )
        
        # Update the appropriate user's confirmation
        if user == match.user1:
            full_connection.user1_confirmed = True
        elif user == match.user2:
            full_connection.user2_confirmed = True
        
        full_connection.save()
        return full_connection

