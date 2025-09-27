from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, OTPVerification, University
from django.core.mail import send_mail
from django.conf import settings
import re


class UniversitySerializer(serializers.ModelSerializer):
    """Serializer for universities"""
    class Meta:
        model = University
        fields = ('id', 'name', 'domain')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with university-first flow"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    university_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = User
        fields = ('university_id', 'university_email', 'password', 'password_confirm')
    
    def validate_university_id(self, value):
        """Validate university exists and is active"""
        try:
            university = University.objects.get(id=value, is_active=True)
            self.context['university'] = university
            return value
        except University.DoesNotExist:
            raise serializers.ValidationError("Invalid university selected")
    
    def validate_university_email(self, value):
        """Validate university email matches selected university domain"""
        university = self.context.get('university')
        if not university:
            raise serializers.ValidationError("Please select a university first")
        
        # Check if email domain matches university domain
        expected_domain = f"@{university.domain}"
        if not value.endswith(expected_domain):
            raise serializers.ValidationError(f"Email must be from {university.name} ({expected_domain})")
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        """Create user and send OTP"""
        validated_data.pop('password_confirm')
        university = validated_data.pop('university_id')
        
        user = User.objects.create_user(
            username=validated_data['university_email'],
            university_email=validated_data['university_email'],
            university=self.context['university'],
            password=validated_data['password'],
            is_active=False  # User is inactive until verified
        )
        
        # Generate and send OTP
        otp = OTPVerification.objects.create(user=user)
        self.send_otp_email(user, otp.otp_code)
        
        return user
    
    def send_otp_email(self, user, otp_code):
        """Send OTP verification email"""
        subject = 'Verify your FriendMatch account'
        message = f"""
        Hi {user.university_email},
        
        Welcome to FriendMatch! Please use the following code to verify your account:
        
        Verification Code: {otp_code}
        
        This code will expire in 10 minutes.
        
        Best regards,
        The FriendMatch Team
        """
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.university_email],
            fail_silently=False,
        )


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    otp_code = serializers.CharField(max_length=6)
    
    def validate_otp_code(self, value):
        """Validate OTP code format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP code must contain only digits")
        return value
    
    def verify_otp(self, user):
        """Verify OTP and activate user"""
        try:
            otp = OTPVerification.objects.filter(
                user=user,
                otp_code=self.validated_data['otp_code'],
                is_used=False
            ).latest('created_at')
            
            if otp.is_expired():
                raise serializers.ValidationError("OTP code has expired")
            
            otp.is_used = True
            otp.save()
            
            user.is_verified = True
            user.is_active = True
            user.save()
            
            return user
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP code")


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    university_email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        """Validate user credentials"""
        university_email = attrs.get('university_email')
        password = attrs.get('password')
        
        if university_email and password:
            user = authenticate(
                username=university_email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            
            if not user.is_active:
                raise serializers.ValidationError("Account is not active")
            
            if not user.is_verified:
                raise serializers.ValidationError("Please verify your email first")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include university_email and password")


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def save(self):
        """Save new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    university = UniversitySerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'university_email', 'university', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')