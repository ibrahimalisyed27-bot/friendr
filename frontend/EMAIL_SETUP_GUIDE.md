# Email Verification Setup Guide

## Problem
Supabase's default email service has limitations and rate limits, causing verification emails to not be sent.

## Solutions

### Option 1: Configure Custom SMTP Provider (Recommended for Production)

#### Using Resend (Free tier available)

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create a free account (3,000 emails/month free)

2. **Get SMTP Credentials**
   - In Resend dashboard, go to "API Keys"
   - Create a new API key
   - Note down the API key

3. **Configure Supabase SMTP**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Settings
   - Scroll down to "SMTP Configuration"
   - Enable "Enable custom SMTP"
   - Fill in the following details:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Your Resend API Key]
     Sender Name: Campus Connect
     Sender Email: [Your verified domain email]
     ```

4. **Verify Domain (Optional but Recommended)**
   - In Resend dashboard, go to "Domains"
   - Add your domain (e.g., yourdomain.com)
   - Follow DNS verification steps
   - Use verified email as sender

#### Alternative SMTP Providers
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **Amazon SES**: AWS email service

### Option 2: Development Mode (Skip Email Verification)

For development/testing purposes, you can disable email confirmation:

1. **In Supabase Dashboard**
   - Go to Authentication > Settings
   - Under "User Signups"
   - Disable "Enable email confirmations"

2. **Update Environment Variables**
   Add to `.env.local`:
   ```
   NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true
   ```

### Option 3: Manual Email Verification (For Testing)

Create a manual verification system for testing:

1. **Create Admin Panel**
   - Build a simple admin interface
   - List unverified users
   - Manually approve accounts

2. **Use Service Role Key**
   - Use the service role key for admin operations
   - Update user verification status manually

## Current Implementation

The signup form now handles both scenarios:
- If email confirmation is required → Shows verify-email page
- If email confirmation is disabled → Goes directly to dashboard

## Testing Email Delivery

1. **Check Supabase Logs**
   - Go to Authentication > Logs
   - Look for signup attempts and email sending

2. **Use Email Testing Tools**
   - **Mailtrap**: Test emails without sending real emails
   - **MailHog**: Local email testing server

3. **Check Spam Folders**
   - Always remind users to check spam/junk folders

## Troubleshooting

### Common Issues:
1. **Rate Limits**: Supabase free tier has email sending limits
2. **Spam Filters**: Emails might be filtered by recipient's email provider
3. **DNS Issues**: Domain verification problems with custom SMTP
4. **API Key Issues**: Incorrect SMTP credentials

### Debug Steps:
1. Check Supabase authentication logs
2. Verify SMTP configuration
3. Test with different email providers
4. Use email testing tools for development

## Next Steps

1. **For Production**: Set up Resend or another SMTP provider
2. **For Development**: Disable email confirmation temporarily
3. **For Testing**: Use email testing tools like Mailtrap

## Environment Variables Needed

Add to `.env.local`:
```
# SMTP Configuration (if using custom SMTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USERNAME=resend
SMTP_PASSWORD=your_resend_api_key
SMTP_SENDER_NAME=Campus Connect
SMTP_SENDER_EMAIL=noreply@yourdomain.com

# Development mode
NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=false
```

