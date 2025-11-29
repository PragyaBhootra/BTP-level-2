# Complete Setup Guide - Complaint Management System

## System Overview
This complaint management system includes:
- **Departments**: Railway, Delhi Police, Income Tax, Delhi Traffic, General
- **Backend**: Python Flask + Gemini AI
- **Frontend**: React + Tailwind CSS + Google OAuth

---

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Gmail account with App Password
- Google Cloud account (for OAuth)
- Gemini API key

---

## Step 1: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Dependencies installed:**
- Flask (web framework)
- google-generativeai (Gemini AI)
- python-dotenv (environment variables)
- flask-cors (Cross-Origin Resource Sharing)

---

## Step 2: Configure Backend Environment

1. **Copy the example file:**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit `backend/.env` with your credentials:**

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password

# Department Email Addresses (update with actual emails)
RAILWAY_EMAIL=railway.complaints@indianrailways.gov.in
DELHI_POLICE_EMAIL=complaints@delhipolice.gov.in
INCOME_TAX_EMAIL=complaints@incometax.gov.in
DELHI_TRAFFIC_EMAIL=traffic.complaints@delhipolice.gov.in
GENERAL_EMAIL=general@example.com
```

---

## Step 3: Get Required API Keys

### 3.1 Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste in `backend/.env` as `GEMINI_API_KEY`

### 3.2 Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-digit password and paste in `backend/.env` as `GMAIL_APP_PASSWORD`

### 3.3 Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized JavaScript origins: `http://localhost:5173`
7. Copy the Client ID

---

## Step 4: Configure Frontend Environment

1. **The frontend dependencies are already installed** (node_modules exists)

2. **Create `frontend/.env`:**
   ```bash
   cd frontend
   copy .env.example .env
   ```

3. **Edit `frontend/.env`:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_API_URL=http://localhost:5000
   ```

---

## Step 5: Update Department Emails (Optional)

The system uses these departments:
- **Railway**: Train, station, railway-related complaints
- **Delhi Police**: Crime, theft, law enforcement
- **Income Tax**: Tax issues, PAN, returns
- **Delhi Traffic**: Traffic violations, accidents, challan
- **General**: Other complaints

Update the email addresses in `backend/.env` with actual department emails.

---

## Step 6: Run the Application

### Terminal 1 - Backend:
```bash
cd backend
python app.py
```
Backend will run on: http://localhost:5000

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

---

## Step 7: Test the System

1. **Open browser**: http://localhost:5173
2. **Sign in** with Google account
3. **Start chatting** with the complaint bot
4. **Provide details**:
   - What is your complaint?
   - Location
   - Date/Time
   - Additional details
5. **Click "Send Email"** to route to the appropriate department

---

## Troubleshooting

### Backend won't start:
- Check if Python dependencies are installed
- Verify `.env` file exists with correct values
- Check if port 5000 is available

### Frontend won't connect:
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Clear browser cache

### Google Sign-in fails:
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check authorized origins in Google Cloud Console
- Use http://localhost:5173 (not 127.0.0.1)

### Email not sending:
- Verify Gmail credentials in backend `.env`
- Ensure App Password (not regular password) is used
- Check if 2FA is enabled on Gmail account

---

## Project Structure

```
BTP level 2/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Backend configuration (create this)
│   └── .env.example       # Template for .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   └── ChatInterface.jsx
│   │   └── App.jsx
│   ├── .env               # Frontend configuration (create this)
│   └── .env.example       # Template for .env
└── README.md
```

---

## Next Steps

1. ✅ Install Python dependencies
2. ✅ Create backend `.env` file
3. ✅ Get API keys (Gemini, Gmail, OAuth)
4. ✅ Create frontend `.env` file
5. ✅ Run both servers
6. ✅ Test complete flow

---

## Support

For issues or questions:
- Check the error messages in terminal
- Verify all API keys are correct
- Ensure both servers are running
- Check browser console for frontend errors
