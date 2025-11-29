# Login System Guide

## 🔐 Authentication Options

The complaint system now supports **TWO ways** to authenticate:

### 1. **Traditional Email/Password** 📧
- Sign up with email, password, and name
- Login with registered credentials
- Data stored in browser localStorage

### 2. **Google OAuth** 🔵
- One-click sign in with Google account
- No password needed
- Secure OAuth 2.0 authentication

---

## 📋 How to Use

### **For New Users:**

#### Option A: Sign Up with Email/Password
1. Open the landing page
2. Click **"Sign Up"** (at bottom of form)
3. Enter:
   - Full Name
   - Email Address
   - Password (min 6 characters)
   - Confirm Password
4. Click **"Create Account"**
5. After account creation, click **"Login"** to sign in

#### Option B: Sign in with Google
1. Open the landing page
2. Click **"Continue with Google"** button
3. Select your Google account
4. Grant permissions
5. You're logged in! ✅

---

### **For Existing Users:**

#### Option A: Login with Email/Password
1. Enter your registered email
2. Enter your password
3. Click **"Login"**

#### Option B: Login with Google
1. Click **"Continue with Google"**
2. Select your Google account
3. You're logged in! ✅

---

## 🎨 Features

### Sign Up Form Includes:
- ✅ Full Name field
- ✅ Email validation
- ✅ Password (minimum 6 characters)
- ✅ Confirm password field
- ✅ Duplicate email detection
- ✅ Password strength validation

### Login Form Includes:
- ✅ Email field
- ✅ Password field
- ✅ Email format validation
- ✅ Credential verification
- ✅ Error messages for invalid login

### UI Features:
- ✅ Beautiful gradient design
- ✅ Toggle between Sign Up / Login
- ✅ "Or continue with" divider
- ✅ Google OAuth button
- ✅ Responsive layout
- ✅ Hover effects and animations

---

## 🔒 Security Notes

### Email/Password Method:
- Passwords stored in browser localStorage
- ⚠️ **Note**: This is for demo purposes only
- 🚀 **For Production**: Use proper backend with:
  - Password hashing (bcrypt)
  - Secure database (PostgreSQL, MongoDB)
  - JWT tokens for sessions
  - HTTPS only

### Google OAuth Method:
- ✅ Secure OAuth 2.0 protocol
- ✅ No password handling by your app
- ✅ Managed by Google's infrastructure
- ✅ Requires `VITE_GOOGLE_CLIENT_ID` in `.env`

---

## 🛠️ Setup Required

### For Email/Password:
- ✅ No additional setup needed
- Works out of the box with localStorage

### For Google OAuth:
1. Get Google OAuth Client ID from: https://console.cloud.google.com/
2. Add to `frontend/.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_API_URL=http://localhost:5000
   ```
3. Add authorized origins in Google Console:
   - `http://localhost:5173`
   - `http://localhost:5000`

---

## 📱 User Flow

```
Landing Page
    ↓
┌─────────────────────────┐
│  Choose Login Method:   │
│                         │
│  1. Email/Password      │
│     → Sign Up           │
│     → Login             │
│                         │
│  2. Google OAuth        │
│     → One-click         │
└─────────────────────────┘
    ↓
Authenticated ✅
    ↓
Chat Interface
    ↓
File Complaint
    ↓
Send Email to Department
```

---

## 💡 Tips

### For Users:
- Use **Google OAuth** for fastest login (recommended)
- Use **Email/Password** if you prefer traditional login
- Your complaint data will be sent from your registered email

### For Developers:
- Toggle is at bottom: "Don't have an account? **Sign Up**"
- Form validates on submit
- Clear error messages for user guidance
- Passwords must be 6+ characters
- Google OAuth requires internet connection

---

## 🎯 What's Stored

### Email/Password Login:
```javascript
localStorage.users = {
  "user@example.com": {
    "name": "John Doe",
    "password": "password123"
  }
}
```

### Google OAuth Login:
```javascript
userData = {
  email: "user@gmail.com",
  name: "John Doe",
  picture: "https://..."
}
```

---

## 🔄 Switching Between Methods

Users can:
- Sign up with email, then login with Google (same email)
- Use either method interchangeably
- Both methods lead to the same chat interface

---

## ✅ Benefits

| Feature | Email/Password | Google OAuth |
|---------|---------------|--------------|
| Quick Setup | ✅ Yes | Requires Client ID |
| No External Account | ✅ Yes | ❌ Needs Google |
| Secure | ⚠️ Demo Only | ✅ Very Secure |
| User Friendly | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Password Reset | ❌ Not implemented | ✅ Google handles |

---

**Recommendation**: Use **Google OAuth** for production. It's more secure and user-friendly! 🚀
