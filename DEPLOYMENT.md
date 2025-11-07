# Deployment Guide

Quick guide to deploy SecureCloud to production.

##  Pre-Deployment Checklist

- [x] MongoDB Atlas cluster created and connection string tested
- [x] AWS S3 bucket created with correct region
- [x] IAM user with S3 permissions created
- [x] All features tested locally
- [x] `.env` files not committed to git
- [x] `.gitignore` properly configured

##  Deployment Steps

### 1. Backend Deployment (Render)

**Create Web Service:**
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `securecloud-backend`
   - **Region**: Choose closest to your S3 bucket
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

**Environment Variables:**
Add these in Render dashboard:
```
PORT=4000
JWT_SECRET=<your-jwt-secret-from-local-env>
JWT_EXPIRES_IN=7d
MONGODB_URI=<your-mongodb-atlas-connection-string>
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
FRONTEND_URL=https://your-app.vercel.app
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=eu-north-1
AWS_S3_BUCKET=<your-bucket-name>
```

**Deploy:**
- Click "Create Web Service"
- Wait 5-10 minutes for initial deploy
- Note your backend URL: `https://securecloud-backend-xxx.onrender.com`

### 2. Frontend Deployment (Vercel)

**Create Project:**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

**Environment Variables:**
Add in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

**Deploy:**
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at: `https://your-app.vercel.app`

### 3. Update Backend CORS

After frontend is deployed, update backend `server.js`:

```javascript
app.use(cors({
  origin: 'https://your-app.vercel.app',
  credentials: true
}));
```

Commit and push - Render will auto-redeploy.

### 4. Update Frontend API URL

Update `frontend/src/services/authService.js` and `fileService.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/auth';
```

Already done if you used the env variable!

##  Post-Deployment Testing

1. **Registration Flow:**
   - Register new user
   - Check email verification (Ethereal preview URL in Render logs)
   - Verify email
   - Login

2. **File Upload:**
   - Set passphrase
   - Upload small test file
   - Check S3 bucket for encrypted file
   - Download and verify decryption works

3. **Authentication:**
   - Logout
   - Login again
   - Check JWT token persists
   - Try protected routes

4. **Error Handling:**
   - Try invalid login
   - Check rate limiting (5 attempts)
   - Upload file > 25MB (should fail)

##  Troubleshooting

**Backend not starting:**
- Check Render logs
- Verify all env vars are set
- MongoDB connection string correct?
- S3 credentials valid?

**Frontend can't reach backend:**
- CORS configured correctly?
- REACT_APP_API_URL set in Vercel?
- Backend URL ends without `/` ?

**File upload fails:**
- S3 bucket exists in correct region?
- IAM permissions include PutObject?
- File size under 25MB?

**Email verification not working:**
- FRONTEND_URL set correctly in backend?
- SMTP credentials valid?
- Check Render logs for email preview URL

##  Cost Estimate

- **Render Free Tier**: $0/month (sleeps after inactivity)
- **Vercel Free Tier**: $0/month
- **MongoDB Atlas M0**: $0/month
- **AWS S3**: ~$0.01/month for first few GB
- **Total**: ~FREE for learning/demo!

##  Auto-Deploy on Git Push

Both Render and Vercel auto-deploy when you push to `main` branch.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your apps will update automatically in 2-5 minutes!

##  Monitoring

- **Render**: Dashboard shows logs, CPU, memory
- **Vercel**: Analytics for frontend performance
- **MongoDB Atlas**: Metrics for database usage
- **AWS S3**: CloudWatch for storage metrics

---

**Note:** Free tier services may have cold starts (first request takes 30s-1min). Consider upgrading for production use.
