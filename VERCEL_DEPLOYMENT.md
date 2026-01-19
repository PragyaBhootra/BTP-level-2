# Vercel Deployment Guide

## Overview
This guide will help you deploy both the backend and frontend of the Complaint Management System on Vercel.

## Prerequisites
1. [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI: `npm install -g vercel`
3. GitHub repository (recommended for automatic deployments)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Deploy Backend

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

4. **Configure Backend Project**
   - **Project Name**: `complaint-system-backend` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Environment Variables** (Click "Environment Variables")
   Add the following:
   ```
   PORT=5000
   GEMINI_API_KEY=AIzaSyCTKSnDw8E1rhjkGuKA3NhMoB_O5bh32s8
   GMAIL_USER=safetybot137@gmail.com
   GMAIL_APP_PASSWORD=yutu jkio dere zacv
   RAILWAY_EMAIL=pbhootra2005@gmail.com
   DELHI_POLICE_EMAIL=pragyabhootra246@gmail.com
   INCOME_TAX_EMAIL=pbhootra2005@gmail.com
   DELHI_TRAFFIC_EMAIL=pbhootra2005@gmail.com
   GENERAL_EMAIL=pbhootra2005@gmail.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
   ⚠️ You'll update `FRONTEND_URL` after deploying the frontend

6. **Click "Deploy"**

7. **Note Your Backend URL**: After deployment, copy the URL (e.g., `https://complaint-system-backend.vercel.app`)

#### Deploy Frontend

1. **Go to Vercel Dashboard Again**

2. **Click "Add New Project"**

3. **Import the Same Repository**

4. **Configure Frontend Project**
   - **Project Name**: `complaint-system-frontend` (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**
   Add the following:
   ```
   VITE_GOOGLE_CLIENT_ID=369349189073-6srsh8hpk1ammht2vjsku54j1alg7ksn.apps.googleusercontent.com
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
   ⚠️ Replace `your-backend-url` with the actual backend URL from step 7 above

6. **Click "Deploy"**

7. **Update Backend Environment Variable**
   - Go back to your backend project settings
   - Update `FRONTEND_URL` to match your frontend URL
   - Redeploy the backend

---

### Option 2: Deploy via Vercel CLI

#### Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy (production)
vercel --prod

# Set environment variables (you'll be prompted to enter values)
vercel env add PORT
vercel env add GEMINI_API_KEY
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
vercel env add RAILWAY_EMAIL
vercel env add DELHI_POLICE_EMAIL
vercel env add INCOME_TAX_EMAIL
vercel env add DELHI_TRAFFIC_EMAIL
vercel env add GENERAL_EMAIL
vercel env add FRONTEND_URL
vercel env add NODE_ENV

# Redeploy after setting env variables
vercel --prod
```

#### Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Deploy (production)
vercel --prod

# Set environment variables
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_API_URL

# Redeploy after setting env variables
vercel --prod
```

---

## Post-Deployment Configuration

### 1. Update Google OAuth Settings

Go to [Google Cloud Console](https://console.cloud.google.com/):
1. Select your project
2. Go to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add your Vercel frontend URL to:
   - **Authorized JavaScript origins**: `https://your-frontend-url.vercel.app`
   - **Authorized redirect URIs**: `https://your-frontend-url.vercel.app`

### 2. Update CORS Settings (if needed)

If you encounter CORS issues, update [backend/server.js](backend/server.js):

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3. Test Your Deployment

1. Visit your frontend URL
2. Test Google OAuth login
3. Test chatbot functionality
4. Test email sending

---

## Important Notes

### Backend Limitations on Vercel
- Vercel serverless functions have a 10-second execution timeout on Hobby plan
- For longer-running operations, consider upgrading to Pro plan
- Email sending should work fine within timeout limits

### Environment Variables
- Always use production values for production deployment
- Never commit `.env` files to version control
- Use Vercel's environment variable management

### Custom Domains (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

---

## Troubleshooting

### Backend Issues
- **504 Gateway Timeout**: Function took too long (>10s on Hobby plan)
- **Environment Variables Not Working**: Make sure to redeploy after adding env vars
- **CORS Errors**: Update CORS configuration to include your frontend URL

### Frontend Issues
- **API Calls Failing**: Check `VITE_API_URL` environment variable
- **Google OAuth Not Working**: Update authorized origins in Google Cloud Console
- **Build Errors**: Check build logs in Vercel dashboard

### Common Solutions
```bash
# View deployment logs
vercel logs <deployment-url>

# List environment variables
vercel env ls

# Pull environment variables locally for testing
vercel env pull
```

---

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch → Production deployment
- Every pull request → Preview deployment
- Configure in Project Settings > Git

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- Check deployment logs for specific errors

## Alternative: Deploy as Monorepo

If you want to deploy both from the same Vercel project, you'll need to create separate projects for backend and frontend as shown above. Vercel works best with separate projects for API and frontend.
