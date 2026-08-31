# CortexOps - Deployment Guide

## Quick Cloud Deployment (Free Tier)

### Option 1: Deploy on Render.com (Recommended - Free Tier Available)

1. **Create a Render account** at https://render.com
2. **Push code to GitHub**
   ```bash
   # Create new repository on GitHub (https://github.com/new)
   # Then push this code:
   git remote add origin https://github.com/YOUR_USERNAME/cortexops.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy Backend on Render**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server-prod.js`
   - Set Environment Variable:
     - Key: `MONGO_URI`
     - Value: `mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0`
   - Choose Free tier plan
   - Deploy!
   
   **Your live URL will be:** `https://cortexops-your-name.onrender.com`

### Option 2: Deploy on Railway.app (Free Trial - $5/month)

1. **Create Railway account** at https://railway.app
2. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy**
   ```bash
   cd c:\Users\kp494\OneDrive\Desktop\cortexops
   railway login
   railway init
   railway up
   ```

4. **Set Environment Variables**
   - In Railway Dashboard, add:
   - `MONGO_URI=mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0`
   - `NODE_ENV=production`

### Option 3: Deploy on Vercel (Full Stack)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend to Vercel**
   ```bash
   cd c:\Users\kp494\OneDrive\Desktop\cortexops\frontend
   vercel
   ```

3. **Deploy Backend to Render/Railway** (as per options above)

4. **Update Frontend API URL**
   - In frontend/.env.production, set:
   - `REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com`

## Test the Deployment

Once deployed, test with:
```bash
# Test API
curl https://your-app-url.onrender.com/api/health

# Test Frontend (open in browser)
https://your-app-url.onrender.com
```

## Environment Variables Needed

For cloud deployment, set these in your platform's environment section:
- `MONGO_URI` - MongoDB Atlas connection string (already provided)
- `NODE_ENV` - Set to "production"
- `PORT` - Will be auto-assigned (no need to set)

## Troubleshooting

**App won't start:**
- Check logs in deployment dashboard
- Verify MONGO_URI is correct
- Ensure Node.js version >= 14

**Can't connect to MongoDB:**
- Verify IP whitelist in MongoDB Atlas includes Render/Railway IPs
- Go to MongoDB Atlas → Network Access → IP Whitelist
- Add: 0.0.0.0/0 (allows all - only for testing/demo)

**Frontend not loading:**
- Ensure `frontend/build` folder exists
- Run `npm --prefix frontend run build` locally first

---

**Total Setup Time:** ~5 minutes  
**Cost:** Free (or minimal)  
**No credit card required for free trial**
