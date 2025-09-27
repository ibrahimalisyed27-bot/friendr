# 🔄 How to Start Fresh - Clear Authentication Session

## **Problem:** 
You're being redirected directly to profile setup instead of starting from login because you're already authenticated from a previous session.

## **✅ Solutions:**

### **Method 1: Use the Clear Session Button (Easiest)**
1. **Go to:** `http://localhost:3002/auth/login`
2. **Look for:** The blue "🧪 Clear Session (Dev)" button at the bottom
3. **Click:** The "Clear Session" button
4. **Refresh:** The page will refresh and you'll be logged out
5. **Start fresh:** Now go to `http://localhost:3002/` to begin the complete flow

### **Method 2: Clear Browser Data**
1. **Open DevTools:** Press F12 in your browser
2. **Go to Application tab**
3. **Click "Storage"** in the left sidebar
4. **Click "Clear storage"**
5. **Check all boxes** and click "Clear site data"
6. **Refresh** the page

### **Method 3: Use Incognito/Private Mode**
1. **Open incognito/private window**
2. **Go to:** `http://localhost:3002/`
3. **Start fresh** without any cached authentication

### **Method 4: Manual Logout URL**
1. **Go to:** `http://localhost:3002/auth/logout`
2. **This will:** Automatically log you out and redirect to login
3. **Then go to:** `http://localhost:3002/` to start the complete flow

---

## **🎯 Complete Testing Flow (After Clearing Session):**

### **Step 1: Start Fresh**
```
http://localhost:3002/
```
- Should redirect to login page
- If not, use one of the methods above to clear session

### **Step 2: Login Page**
- **Option A:** Sign in with existing account
- **Option B:** Click "Sign up" to create new account

### **Step 3: Signup Flow**
- Fill out form with ASU email
- Click "Sign Up"
- Get redirected to email verification page

### **Step 4: Email Verification**
- Click the blue verification link
- Get redirected to dashboard

### **Step 5: Profile Setup**
- Complete your profile
- Get redirected to pending page

---

## **🔍 Debugging:**

### **Check Console Logs:**
- Open DevTools (F12)
- Look for "Homepage: User authenticated: true/false"
- This tells you if you're logged in

### **Check Network Tab:**
- Look for authentication requests
- Check if cookies are being sent

### **Expected Behavior:**
- **Not logged in:** Homepage → Login page
- **Logged in:** Homepage → Dashboard → Profile setup (if incomplete)

---

## **🚀 Quick Fix:**

**Fastest way to start fresh:**
1. Go to: `http://localhost:3002/auth/login`
2. Click: "🧪 Clear Session (Dev)" button
3. Go to: `http://localhost:3002/`
4. Should now start from login page!

This will give you the complete authentication flow from the beginning!

