#!/usr/bin/env python
"""
Simple API test script for FriendMatch backend
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_api():
    """Test basic API functionality"""
    print("Testing FriendMatch API...")
    
    # Test registration
    print("\n1. Testing user registration...")
    registration_data = {
        "university_email": "test@university.edu",
        "email": "test@example.com",
        "password": "testpassword123",
        "password_confirm": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register/", json=registration_data)
        print(f"Registration status: {response.status_code}")
        if response.status_code == 201:
            print("✓ Registration successful")
            user_data = response.json()
            print(f"User ID: {user_data.get('user_id')}")
        else:
            print(f"✗ Registration failed: {response.text}")
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure the server is running.")
        return False
    
    # Test OTP verification (this will fail without actual OTP)
    print("\n2. Testing OTP verification...")
    otp_data = {
        "user_id": 1,  # Assuming user ID 1
        "otp_code": "123456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/verify-otp/", json=otp_data)
        print(f"OTP verification status: {response.status_code}")
        if response.status_code == 200:
            print("✓ OTP verification successful")
        else:
            print(f"✗ OTP verification failed: {response.text}")
    except Exception as e:
        print(f"✗ OTP verification error: {e}")
    
    # Test login
    print("\n3. Testing user login...")
    login_data = {
        "university_email": "test@university.edu",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Login successful")
            login_response = response.json()
            print(f"Access token: {login_response.get('tokens', {}).get('access', 'Not found')[:20]}...")
        else:
            print(f"✗ Login failed: {response.te}")
    except Exception as e:
        print(f"✗ Login error: {e}")
    
    # Test profile creation (requires authentication)
    print("\n4. Testing profile creation...")
    profile_data = {
        "full_name": "Test User",
        "preferred_name": "Test",
        "year": "junior",
        "hobbies": "Reading, Coding, Gaming",
        "interests": "Technology, Science, Music",
        "summary": "A friendly person looking for new friends!"
    }
    
    # This will fail without proper authentication
    try:
        response = requests.post(f"{BASE_URL}/profiles/create/", json=profile_data)
        print(f"Profile creation status: {response.status_code}")
        if response.status_code == 201:
            print("✓ Profile creation successful")
        else:
            print(f"✗ Profile creation failed: {response.text}")
    except Exception as e:
        print(f"✗ Profile creation error: {e}")
    
    print("\nAPI test completed!")
    print("\nNote: Some tests may fail without proper authentication tokens.")
    print("To fully test the API, you'll need to:")
    print("1. Start the server: python run_server.py")
    print("2. Register a user and verify OTP")
    print("3. Login to get authentication tokens")
    print("4. Use tokens in Authorization header for protected endpoints")

if __name__ == '__main__':
    test_api()

