# Complete Authentication Flow Testing Guide

## 🚀 **Complete Testing Flow**

### **Starting Point:**
```
http://localhost:3002/
```

This will automatically redirect you to the login page.

---

## **Step 1: Login Page**
**URL:** `http://localhost:3002/auth/login`

### **Option A: If you have an account**
- Enter your email and password
- Click "Sign In"
- Go directly to dashboard

### **Option B: If you don't have an account**
- Click "Sign up" link at the bottom
- Go to Step 2

---

## **Step 2: Signup Page**
**URL:** `http://localhost:3002/auth/signup`

### **Fill out the form:**
- **First Name:** `John`
- **Last Name:** `Doe`
- **University:** Select "Arizona State University"
- **ASU Email:** `john.doe@asu.edu` (must end with @asu.edu)
- **Password:** `password123` (minimum 6 characters)
- **Confirm Password:** `password123`

### **Click "Sign Up"**
- You'll see console logs showing the signup process
- You'll be redirected to the email verification page

---

## **Step 3: Email Verification Page**
**URL:** `http://localhost:3002/auth/verify-email`

### **What you'll see:**
- Message about checking your email
- **Blue testing box** with a verification link
- The link will look like: `http://localhost:3002/auth/callback?next=/dashboard&code=test-code`

### **Click the verification link**
- This simulates clicking the link from your email
- You'll be redirected to the dashboard

---

## **Step 4: Dashboard**
**URL:** `http://localhost:3002/dashboard`

### **What happens:**
- Dashboard checks if you have a complete profile
- Since you just signed up, you'll be redirected to profile setup

---

## **Step 5: Profile Setup**
**URL:** `http://localhost:3002/profile/setup`

### **Complete your profile:**
- **Bio:** Write a short description about yourself
- **Major:** Select your major (e.g., Computer Science)
- **Graduation Year:** Select your graduation year
- **Interests:** Select up to 10 interests
- **Profile Photo:** Upload a photo (optional)

### **Click "Complete Profile"**
- You'll be redirected to the pending verification page

---

## **Step 6: Profile Pending**
**URL:** `http://localhost:3002/profile/pending`

### **What you'll see:**
- Profile is under review
- Status indicators showing progress
- Option to edit profile

---

## **Step 7: Main App (Swipe Interface)**
**URL:** `http://localhost:3002/swipe`

### **To access the main app:**
- In a real scenario, an admin would approve your profile
- For testing, you can manually update the database or modify the code

---

## **🔄 Complete Flow Summary:**

```
Homepage (/) 
    ↓
Login Page (/auth/login)
    ↓
Signup Page (/auth/signup)
    ↓
Email Verification (/auth/verify-email)
    ↓ (click test link)
Dashboard (/dashboard)
    ↓
Profile Setup (/profile/setup)
    ↓
Profile Pending (/profile/pending)
    ↓ (after approval)
Main App (/swipe)
```

---

## **🧪 Testing Features:**

### **Email Verification Testing:**
- ✅ No real email sent (development mode)
- ✅ Test verification link provided
- ✅ Console logs show the process
- ✅ Simulates real email verification flow

### **Form Validation:**
- ✅ All fields required
- ✅ ASU email validation (@asu.edu only)
- ✅ Password confirmation matching
- ✅ University selection required

### **Authentication Flow:**
- ✅ Proper redirects between pages
- ✅ Middleware protection
- ✅ Session management
- ✅ Profile creation automation

---

## **🐛 Debugging:**

### **Check Console Logs:**
- Open browser DevTools (F12)
- Look for signup process logs
- Check for any error messages

### **Check Network Tab:**
- Monitor API calls to Supabase
- Check for failed requests

### **Common Issues:**
1. **Email not @asu.edu:** Must use Arizona State University email
2. **Password too short:** Minimum 6 characters
3. **Missing fields:** All fields are required
4. **University not selected:** Must select Arizona State University

---

## **🎯 Quick Test:**

**Fastest way to test the complete flow:**

1. Go to: `http://localhost:3002/`
2. Click "Sign up"
3. Fill form with `test@asu.edu` and `password123`
4. Click "Sign Up"
5. Click the blue verification link
6. Complete profile setup
7. See the pending page

**Total time: ~2-3 minutes**

