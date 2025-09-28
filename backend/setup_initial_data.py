#!/usr/bin/env python
"""
Script to set up initial data for FriendMatch backend
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'friendmatch_backend.settings')
django.setup()

from accounts.models import University, User

def setup_initial_data():
    """Set up initial data"""
    print("Setting up initial data...")
    
    # Create Arizona State University
    asu, created = University.objects.get_or_create(
        name='Arizona State University',
        defaults={
            'domain': 'asu.edu',
            'is_active': True
        }
    )
    
    if created:
        print("✅ Created Arizona State University")
    else:
        print("✅ Arizona State University already exists")
    
    # Create admin user if it doesn't exist
    admin_email = 'admin@asu.edu'
    if not User.objects.filter(university_email=admin_email).exists():
        admin_user = User.objects.create_superuser(
            username=admin_email,
            university_email=admin_email,
            university=asu,
            password='admin123'
        )
        print("✅ Created admin user: admin@asu.edu / admin123")
    else:
        print("✅ Admin user already exists")
    
    print("\n🎉 Initial data setup complete!")
    print("\nAvailable endpoints:")
    print("- Universities: http://127.0.0.1:8000/api/auth/universities/")
    print("- Register: http://127.0.0.1:8000/api/auth/register/")
    print("- Admin: http://127.0.0.1:8000/admin/")
    print("\nRegistration now requires:")
    print("- university_email (must be @asu.edu)")
    print("- university_name (must be 'Arizona State University')")
    print("- password")
    print("- password_confirm")

if __name__ == '__main__':
    setup_initial_data()

