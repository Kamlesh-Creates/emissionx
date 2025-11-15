# Deployment Guide for Vercel

This guide will help you deploy EmissionX to Vercel.

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] All API routes working
- [x] MongoDB connection optimized for serverless
- [x] No hardcoded localhost URLs
- [x] Environment variables properly configured
- [x] Build scripts configured in package.json

### 🔧 Required Environment Variables

Before deploying, you need to set these environment variables in Vercel:

1. **MONGODB_URI** (Required)
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/emissionx?retryWrites=true&w=majority`
   - **Important**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access to allow Vercel to connect

2. **NEXT_PUBLIC_BASE_URL** (Optional)
   - Your production URL (e.g., `https://your-app.vercel.app`)
   - Currently not used in code, but good to have for future features

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No (first time) or Yes (updates)
# - Project name: emissionx
# - Directory: ./
# - Override settings: No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add the following:

   **Production:**
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/emissionx?retryWrites=true&w=majority
   ```

   **Preview:**
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/emissionx?retryWrites=true&w=majority
   ```

   **Development:**
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/emissionx?retryWrites=true&w=majority
   ```

3. Click "Save"

### 4. Configure MongoDB Atlas

**CRITICAL**: Whitelist Vercel's IP addresses in MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (or add `0.0.0.0/0`)
   - ⚠️ For production, consider restricting to Vercel IPs
5. Save changes

### 5. Redeploy

After setting environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "..." on the latest deployment
3. Click "Redeploy"

Or trigger a new deployment by pushing to your main branch.

## Post-Deployment Verification

### ✅ Check Deployment Status
- Visit your Vercel URL: `https://your-app.vercel.app`
- Check that the homepage loads

### ✅ Test Key Features
1. **Registration/Login**
   - Go to `/auth`
   - Create a new account
   - Login with the account

2. **Carbon Calculator**
   - Go to `/form`
   - Fill out the form
   - Calculate footprint
   - Save to profile

3. **Profile**
   - Go to `/profile`
   - Verify data is saved
   - Check activities appear

### ✅ Check Logs
- Go to Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Look for "✅ Connected to MongoDB" message
- Check for any errors

## Troubleshooting

### ❌ MongoDB Connection Errors

**Issue**: "MongoServerError: connection timeout"

**Solutions**:
1. Verify `MONGODB_URI` is set correctly in Vercel environment variables
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Verify database user has proper permissions
4. Check MongoDB Atlas cluster is running

### ❌ Build Errors

**Issue**: Build fails during `npm run build`

**Solutions**:
1. Check TypeScript errors locally: `npm run build`
2. Verify all dependencies are in `package.json`
3. Check for missing environment variables (they're not available at build time, which is fine)
4. Check Next.js version compatibility

### ❌ Runtime Errors

**Issue**: App crashes or shows errors in production

**Solutions**:
1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Check MongoDB connection is working
4. Verify API routes are accessible

### ❌ Environment Variables Not Working

**Issue**: `process.env.MONGODB_URI` is undefined

**Solutions**:
1. Ensure variables are set in Vercel Dashboard (not just `.env.local`)
2. Redeploy after adding environment variables
3. Check variable names match exactly (case-sensitive)
4. For `NEXT_PUBLIC_*` variables, rebuild is required

## Performance Optimization

### MongoDB Connection
- ✅ Connection caching implemented for serverless
- ✅ Timeouts configured for fast cold starts
- ✅ Buffer commands disabled

### Next.js Configuration
- ✅ Static generation where possible
- ✅ API routes optimized for serverless
- ✅ No unnecessary dependencies

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in analytics
- **MongoDB Atlas Monitoring**: Database performance
- **Vercel Logs**: Error tracking

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_BASE_URL` if needed

## Security Checklist

- [x] Environment variables not committed to git
- [x] MongoDB credentials secured
- [x] API routes have proper error handling
- [x] User input validated
- [ ] Consider adding rate limiting for API routes
- [ ] Consider adding CORS configuration if needed

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Test locally with production environment variables
4. Review error messages carefully

---

**Good luck with your deployment! 🚀**

