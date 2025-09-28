from rest_framework import serializers
from .models import UserProfile, ProfilePicture
from accounts.serializers import UserSerializer


class ProfilePictureSerializer(serializers.ModelSerializer):
    """Serializer for profile pictures"""
    class Meta:
        model = ProfilePicture
        fields = ('id', 'image', 'is_primary', 'created_at')
        read_only_fields = ('id', 'created_at')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    pictures = ProfilePictureSerializer(many=True, read_only=True)
    ai_summary = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = (
            'user', 'full_name', 'preferred_name', 'year', 
            'hobbies', 'interests', 'summary', 'theme',
            'pictures', 'ai_summary', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')
    
    def get_ai_summary(self, obj):
        """Get AI-generated summary"""
        return obj.get_ai_summary()


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user profile"""
    class Meta:
        model = UserProfile
        fields = (
            'full_name', 'preferred_name', 'year', 
            'hobbies', 'interests', 'summary', 'theme'
        )
    
    def create(self, validated_data):
        """Create profile for the authenticated user"""
        user = self.context['request'].user
        profile = UserProfile.objects.create(user=user, **validated_data)
        return profile


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = UserProfile
        fields = (
            'full_name', 'preferred_name', 'year', 
            'hobbies', 'interests', 'summary', 'theme'
        )


class SwipeProfileSerializer(serializers.ModelSerializer):
    """Serializer for profiles shown in swiping (limited info)"""
    ai_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ('id', 'preferred_name', 'ai_summary')
    
    def get_ai_summary(self, obj):
        """Get AI-generated summary"""
        return obj.get_ai_summary()


class ProfilePictureUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading profile pictures"""
    class Meta:
        model = ProfilePicture
        fields = ('image', 'is_primary')
    
    def create(self, validated_data):
        """Create profile picture for the authenticated user"""
        profile = self.context['request'].user.profile
        picture = ProfilePicture.objects.create(profile=profile, **validated_data)
        return picture

