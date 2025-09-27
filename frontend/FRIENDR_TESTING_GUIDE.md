# Friendr - Complete Testing Guide

## 🎯 App Overview
Friendr is a college friend-finding app for Arizona State University students with AI-powered personality matching, gradual profile reveal, and mutual "Meet in Person" confirmations.

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3002` (or the next available port)

### 2. Test the Complete Flow

#### Step 1: Sign Up
1. Go to `http://localhost:3002`
2. Click "Sign Up" at the bottom of the login page
3. Use an ASU email (e.g., `test@asu.edu`)
4. Create a password
5. Click "Create Account"

#### Step 2: Email Verification (Development Mode)
- **If `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true`**: You'll be redirected directly to profile setup
- **If `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=false`**: You'll see a verification page with a test link

#### Step 3: Profile Setup
1. Fill out your profile:
   - First Name, Last Name
   - Bio (at least 50 characters)
   - Major
   - Graduation Year
   - Interests (select at least 3)
   - Profile Photo (optional - will work even without storage bucket)
2. Click "Complete Profile"
3. You'll be redirected to the main app dashboard

#### Step 4: Main App Features

**Tab 1: Discover (Swiping)**
- See potential matches with AI personality summaries
- Each card shows:
  - Animal avatar (consistent per user)
  - First name
  - AI-generated personality summary
  - Compatibility score and reasons
  - "Meet in Person" button
- Swipe left to pass, right to connect
- Use "Keep Looking" to see more users

**Tab 2: Messages**
- View your matches
- Each match shows:
  - Animal avatar
  - First name
  - AI personality summary
  - "Meet in Person" button
  - Message button
  - Report button
- Click "Meet in Person" to reveal full profile (requires mutual confirmation)

**Tab 3: Settings**
- **Profile**: View and edit profile information
- **Privacy & Safety**: Toggle profile visibility, view reported/blocked users
- **Notifications**: Toggle push notifications
- **Appearance**: Toggle dark mode
- **Security**: Change password
- **Account**: Sign out or delete account

## 🔧 Key Features to Test

### 1. AI Personality Matching
- Each user gets a unique AI-generated personality summary
- Compatibility scores are calculated based on interests, major, and bio
- Reasons for compatibility are displayed

### 2. Animal Avatars
- Each user gets a consistent animal avatar based on their user ID
- Avatars are displayed instead of real photos for privacy

### 3. Mutual "Meet in Person" System
- Users can request to "Meet in Person"
- Both users must confirm to reveal full profiles
- Full profiles show complete bio and interests

### 4. Gradual Profile Reveal
- Initial view shows only AI summary and basic info
- Full profile revealed only after mutual confirmation

### 5. Report System
- Users can report inappropriate behavior
- Report button available on all user interactions

## 🐛 Common Issues & Solutions

### Issue: "Bucket not found" error
**Solution**: Profile photos are optional. The app will work without the storage bucket.

### Issue: Email verification not working
**Solution**: 
- Set `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true` in `.env.local` for development
- Or use the test verification link on the verify-email page

### Issue: Blank pages after profile submission
**Solution**: Profiles are auto-approved. You should be redirected to the dashboard immediately.

### Issue: No matches showing
**Solution**: Create multiple test accounts with different profiles to see matches.

## 📱 Testing Different Scenarios

### Scenario 1: New User Journey
1. Sign up with ASU email
2. Complete profile setup
3. Explore the swiping interface
4. Test the "Meet in Person" feature
5. Check settings and profile management

### Scenario 2: Multiple Users
1. Create 2-3 test accounts
2. Complete profiles for each
3. Test matching between accounts
4. Test mutual confirmations
5. Test messaging (if implemented)

### Scenario 3: Edge Cases
1. Try signing up with non-ASU email (should be rejected)
2. Try incomplete profile submission
3. Test report functionality
4. Test password change
5. Test account deletion

## 🎨 UI/UX Features

### Design Elements
- Modern, Instagram-like 3-tab navigation
- Gradient backgrounds and smooth animations
- Consistent animal avatars for privacy
- AI-generated personality summaries
- Compatibility scoring system

### Responsive Design
- Works on desktop and mobile
- Touch-friendly swipe gestures
- Accessible color schemes

## 🔐 Security Features

### Authentication
- ASU email verification required
- Secure password requirements
- Session management

### Privacy
- Animal avatars instead of real photos
- Gradual profile reveal system
- Report and block functionality

## 📊 Database Schema

### Key Tables
- `profiles`: User profile information
- `matches`: Swipe connections
- `mutual_confirmations`: "Meet in Person" confirmations
- `reports`: User reports

## 🚀 Production Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=false
```

### Required Setup
1. Supabase project with proper RLS policies
2. Custom SMTP for email verification (see EMAIL_SETUP_GUIDE.md)
3. Storage bucket for profile photos (see STORAGE_SETUP_GUIDE.md)

## 🎯 Success Criteria

The app is working correctly if:
- ✅ Users can sign up with ASU emails only
- ✅ Profile setup completes without errors
- ✅ AI personality summaries are generated
- ✅ Animal avatars are displayed consistently
- ✅ Swiping interface works smoothly
- ✅ Mutual confirmations reveal full profiles
- ✅ Settings allow profile editing and password changes
- ✅ Report system functions properly
- ✅ No blank pages or broken redirects

## 🆘 Troubleshooting

### Clear Session for Testing
```bash
curl -X POST http://localhost:3002/auth/logout
```

### Check Server Logs
Look for any error messages in the terminal where `npm run dev` is running.

### Database Issues
Check Supabase dashboard for any RLS policy issues or missing tables.

---

**Happy Testing! 🎉**

The Friendr app should provide a smooth, engaging experience for ASU students to find meaningful connections on campus.
