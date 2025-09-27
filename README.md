# FriendMatch Backend

A Django REST Framework backend for a college friend-matching MVP web app ("Tinder for Friends").

## Features

### 🔑 Authentication
- Custom User model using university email as the login
- OTP-based email verification on signup
- JWT authentication for login sessions
- Password change functionality

### 👤 User Profile
- Profile creation after account verification
- Profile fields: full name, preferred name, year, hobbies, interests, summary, pictures
- AI-generated summary combining profile information
- Theme settings (light/dark)

### ⚙️ Settings
- Edit profile information
- Change password
- Change theme
- Upload/manage profile pictures

### 🔄 Swiping & Matching
- Swipe profiles based on year and interests
- Two actions: "Skip" and "Wave"
- Automatic match creation when both users wave
- Full connection feature to reveal all details

### 💬 Messaging
- Chat with matches
- Text messages (always available)
- Image messages (after full connection)
- Read status tracking
- Chat list with unread counts

### 🚨 Reporting
- Report users with reasons and evidence
- Admin email notifications
- Admin panel for managing reports

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd friendmatch_backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/verify-otp/` - Verify OTP
- `POST /api/auth/resend-otp/` - Resend OTP
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/change-password/` - Change password
- `GET /api/auth/profile/` - Get user profile

### Profiles
- `GET /api/profiles/` - Get/update user profile
- `POST /api/profiles/create/` - Create user profile
- `GET /api/profiles/swipe-profiles/` - Get profiles for swiping
- `GET /api/profiles/pictures/` - Get profile pictures
- `POST /api/profiles/pictures/upload/` - Upload profile picture
- `DELETE /api/profiles/pictures/<id>/delete/` - Delete profile picture
- `PATCH /api/profiles/pictures/<id>/set-primary/` - Set primary picture

### Matching
- `POST /api/matching/swipe/` - Swipe on a user
- `GET /api/matching/matches/` - Get user's matches
- `GET /api/matching/matches/<id>/` - Get match details
- `POST /api/matching/matches/<id>/fully-connect/` - Confirm full connection
- `GET /api/matching/swipe-history/` - Get swipe history
- `GET /api/matching/swipeable-profiles/` - Get swipeable profiles

### Messaging
- `GET /api/messaging/chats/` - Get chat list
- `GET /api/messaging/chats/<id>/messages/` - Get messages for a match
- `POST /api/messaging/chats/<id>/messages/` - Send message
- `POST /api/messaging/chats/<id>/mark-read/` - Mark messages as read
- `GET /api/messaging/unread-count/` - Get unread message count
- `POST /api/messaging/chats/<id>/send-text/` - Send text message
- `POST /api/messaging/chats/<id>/send-image/` - Send image message

### Reporting
- `POST /api/reporting/` - Create a report
- `GET /api/reporting/my-reports/` - Get user's reports
- `GET /api/reporting/my-reports/<id>/` - Get report details
- `GET /api/reporting/admin/all/` - Get all reports (admin)
- `PATCH /api/reporting/admin/<id>/` - Update report (admin)
- `GET /api/reporting/admin/stats/` - Get report statistics (admin)

## Models

### User
- Custom user model with university email authentication
- Email verification system

### UserProfile
- Profile information for each user
- Year, hobbies, interests, summary
- Profile pictures management

### Swipe
- Tracks user swipes (skip/wave)
- Prevents duplicate swipes

### Match
- Created when both users wave at each other
- Tracks full connection status

### Message
- Chat messages between matched users
- Support for text and image messages

### Report
- User reporting system
- Admin notification system

## Configuration

### Email Settings
Configure email settings in `settings.py` or environment variables:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USE_TLS`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`

### JWT Settings
JWT tokens are configured in `settings.py`:
- Access token lifetime: 24 hours
- Refresh token lifetime: 7 days
- Token rotation enabled

### CORS Settings
Configure CORS origins for frontend integration:
- Default: `http://localhost:3000`, `http://127.0.0.1:3000`

## Admin Interface

Access the Django admin interface at `/admin/` to:
- Manage users and profiles
- View and manage reports
- Monitor matches and messages
- System administration

## Development

### Running Tests
```bash
python manage.py test
```

### Database Reset
```bash
python manage.py flush
python manage.py migrate
```

### Collect Static Files
```bash
python manage.py collectstatic
```

## Production Deployment

1. Set `DEBUG = False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up email service (SendGrid, AWS SES, etc.)
4. Configure static file serving
5. Set up SSL/HTTPS
6. Configure proper CORS origins

## API Documentation

The API uses Django REST Framework with JWT authentication. All endpoints require authentication except:
- User registration
- OTP verification
- OTP resend
- User login

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Frontend Integration

This backend is designed to work with a React frontend. The API provides:
- JWT-based authentication
- CORS support for localhost development
- Image upload support
- Real-time messaging capabilities
- Comprehensive error handling

## Support

For issues and questions, please check the Django documentation and Django REST Framework documentation.

