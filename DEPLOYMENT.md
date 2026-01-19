# Deployment Guide - Render

## Prerequisites
- GitHub account with project repository
- Render account (free tier available)
- All environment variables ready

## Deployment Steps

### 1. Backend Deployment (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository

**Service Configuration:**
- **Name**: `complaint-system-backend`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

**Environment Variables to Add:**
```
PORT=5000
GEMINI_API_KEY=<your-gemini-key>
GMAIL_USER=<your-gmail>
GMAIL_APP_PASSWORD=<your-app-password>
RAILWAY_EMAIL=<email>
DELHI_POLICE_EMAIL=<email>
INCOME_TAX_EMAIL=<email>
DELHI_TRAFFIC_EMAIL=<email>
GENERAL_EMAIL=<email>
FRONTEND_URL=<will-add-after-frontend-deployment>
```

4. Click **Create Web Service**
5. Copy the deployed URL (e.g., `https://complaint-system-backend.onrender.com`)

### 2. Frontend Deployment (Static Site)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Static Site**
3. Connect same GitHub repository

**Site Configuration:**
- **Name**: `complaint-system-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables to Add:**
```
VITE_API_URL=<your-backend-url-from-step-1>
VITE_GOOGLE_CLIENT_ID=369349189073-6srsh8hpk1ammht2vjsku54j1alg7ksn.apps.googleusercontent.com
```

4. Click **Create Static Site**
5. Copy the deployed URL (e.g., `https://complaint-system-frontend.onrender.com`)

### 3. Update Backend CORS

1. Go back to your backend service in Render
2. Add/Update environment variable:
   - `FRONTEND_URL` = `<your-frontend-url-from-step-2>`
3. Save changes (backend will auto-redeploy)

## Post-Deployment

### Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add Authorized JavaScript origins:
   - `https://complaint-system-frontend.onrender.com`
5. Add Authorized redirect URIs:
   - `https://complaint-system-frontend.onrender.com`

### Test Your Deployment
- Visit your frontend URL
- Test Google OAuth login
- Test chatbot functionality
- Verify email sending works

## Important Notes

### Free Tier Limitations
- Backend may spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds (cold start)
- 750 hours/month of runtime

### Custom Domain (Optional)
1. In Render, go to your static site settings
2. Click "Custom Domains"
3. Add your domain and follow DNS instructions

## Troubleshooting

### Backend Not Starting
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script

### Frontend Not Loading
- Check if `VITE_API_URL` is set correctly
- Verify build command produced `dist` folder
- Check browser console for CORS errors

### CORS Errors
- Ensure `FRONTEND_URL` is set in backend
- Check backend CORS configuration includes frontend URL
- Verify URLs don't have trailing slashes

### OAuth Not Working
- Update Google OAuth authorized origins/redirects
- Clear browser cache and cookies
- Check OAuth credentials in code match Google Console

## Monitoring

- Check logs: Dashboard → Your Service → Logs
- Set up email alerts in Render settings
- Monitor usage in Render dashboard

## Updating Deployment

Any push to your GitHub main/master branch will automatically trigger a redeploy on Render.
