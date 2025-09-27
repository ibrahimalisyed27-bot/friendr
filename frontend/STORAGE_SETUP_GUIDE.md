# Supabase Storage Bucket Setup Guide

## Problem
The "Bucket not found" error occurs because the Supabase storage bucket for profile photos doesn't exist.

## ✅ Quick Fix (Already Applied)
The profile setup now handles missing storage gracefully:
- Photo upload is optional
- If storage bucket doesn't exist, profile creation continues without photo
- No more "Bucket not found" errors

## 🔧 Proper Storage Setup (Optional)

If you want to enable photo uploads, follow these steps:

### 1. Create Storage Bucket in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

3. **Create Bucket**
   - **Name:** `profile-photos`
   - **Public:** ✅ Check this (so photos can be viewed)
   - **File size limit:** 5MB (recommended)
   - **Allowed MIME types:** `image/*`

4. **Set Up Policies**
   - Click on the `profile-photos` bucket
   - Go to "Policies" tab
   - Click "New policy"

   **Policy 1: Allow authenticated users to upload**
   ```sql
   CREATE POLICY "Users can upload their own photos" ON storage.objects
   FOR INSERT WITH CHECK (
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 2: Allow public read access**
   ```sql
   CREATE POLICY "Public can view photos" ON storage.objects
   FOR SELECT USING (bucket_id = 'profile-photos');
   ```

### 2. Test Photo Upload

After setting up the bucket:
1. Go to profile setup
2. Try uploading a photo
3. Should work without errors

## 🚀 Current Status

**✅ Profile setup works without storage bucket**
- Users can complete profiles without photos
- No more "Bucket not found" errors
- App functions fully without photo uploads

**📸 Photo uploads are optional**
- If bucket exists: photos work
- If bucket doesn't exist: profiles work without photos
- Graceful fallback for all scenarios

## 🎯 Recommendation

**For Development:** Keep it as is - profiles work without photos
**For Production:** Set up the storage bucket for photo uploads

The app is fully functional either way!

