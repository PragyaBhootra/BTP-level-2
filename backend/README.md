# Complaint Management System - Backend

Python Flask backend with Gemini AI integration for intelligent complaint routing.

## Features

- **Gemini AI Chatbot**: Interactive complaint collection
- **Department Classification**: Automatic routing to appropriate departments
- **Email Integration**: Automated email notifications
- **RESTful API**: Clean API endpoints for frontend integration

## Setup

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key
   - Configure email credentials (Gmail App Password recommended)
   - Set department email addresses

4. **Run Development Server**:
   ```bash
   python app.py
   ```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/chat` - Chatbot conversation
- `POST /api/classify-department` - Classify complaint to department
- `POST /api/send-email` - Send complaint email

## Gmail Setup

To send emails via Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in your `.env` file
