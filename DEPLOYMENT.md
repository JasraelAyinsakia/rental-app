# 🚀 Deployment Guide - Mould Rental Tracker

## Prerequisites

✅ Railway PostgreSQL database (already set up)  
✅ GitHub account  
✅ Vercel account (free - sign up at vercel.com)

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Mould Rental Tracker"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `mould-rental-tracker`
3. Make it **Private** (recommended)
4. Click **"Create repository"**

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mould-rental-tracker.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find `mould-rental-tracker` in the list
3. Click **"Import"**

### 2.3 Configure Project

**Framework Preset**: Next.js (should auto-detect)  
**Root Directory**: `./` (leave as is)  
**Build Command**: `npm run build` (default)  
**Output Directory**: `.next` (default)

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these:

```env
DATABASE_URL
postgresql://postgres:YcGcweGoYWRZRPNxZxNRmtNlOwOMTLtY@yamanote.proxy.rlwy.net:50203/railway

NEXTAUTH_SECRET
/dnm02jmk3+2lsobBLoGoBk5hGw9X9YvIaLFin/k9k8=

NEXTAUTH_URL
https://your-app-name.vercel.app

NEXT_PUBLIC_COMPANY_NAME
FloorMasters

NEXT_PUBLIC_COMPANY_ADDRESS
apuseyinejake011@gmail.com

NEXT_PUBLIC_COMPANY_CONTACT
+233241834820

NEXT_PUBLIC_COMPANY_EMAIL
apuseyinejake011@gmail.com
```

⚠️ **Important**: For `NEXTAUTH_URL`, use your actual Vercel URL (you'll get this after first deployment, then update it)

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://mould-rental-tracker.vercel.app`

---

## Step 3: Post-Deployment Setup

### 3.1 Update NEXTAUTH_URL

1. Copy your Vercel URL (e.g., `https://mould-rental-tracker.vercel.app`)
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Click **Edit** → Update with your actual URL
5. Click **Save**
6. Go to **Deployments** tab → Click **"..."** on latest deployment → **"Redeploy"**

### 3.2 Run Database Migrations

The database is already set up on Railway, so no additional steps needed!

### 3.3 Test the Application

1. Go to your Vercel URL
2. Login with: `apuseyinejake011@gmail.com` / `Jasrael38`
3. Test creating a rental
4. Test inventory management
5. Test returning a rental

---

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `mouldtracker.com`)
4. Follow DNS configuration instructions

### 4.2 Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://mouldtracker.com
```

Then redeploy.

---

## Environment Variables Reference

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Railway PostgreSQL connection string | From Railway dashboard |
| `NEXTAUTH_SECRET` | Generated secret key | Keep secret! |
| `NEXTAUTH_URL` | Your app URL | Update after deployment |
| `NEXT_PUBLIC_COMPANY_NAME` | FloorMasters | Your company name |
| `NEXT_PUBLIC_COMPANY_ADDRESS` | Your address | For receipts |
| `NEXT_PUBLIC_COMPANY_CONTACT` | +233... | Contact number |
| `NEXT_PUBLIC_COMPANY_EMAIL` | Your email | Contact email |

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module '@prisma/client'"

**Solution**: Prisma should generate automatically. If not, add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
Already added! ✅

### Database Connection Issues

**Error**: "Can't reach database"

**Solution**: 
1. Check DATABASE_URL is correct in Vercel
2. Make sure Railway database is running
3. Verify Railway allows external connections (should be enabled by default)

### Authentication Issues

**Error**: "NEXTAUTH_URL mismatch"

**Solution**: Update `NEXTAUTH_URL` to match your actual Vercel URL

### 404 on Pages

**Error**: Pages not found after deployment

**Solution**: This shouldn't happen with Next.js App Router, but if it does:
- Check all files are committed to Git
- Redeploy from Vercel dashboard

---

## Continuous Deployment

Once set up, every time you push to GitHub:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will **automatically**:
1. Detect the push
2. Build your app
3. Deploy the new version
4. Give you a preview URL

---

## Monitoring & Maintenance

### Check Deployment Status

Vercel Dashboard → Deployments → View build logs

### Database Management

Railway Dashboard → PostgreSQL → Metrics

### View Logs

Vercel Dashboard → Your Project → **Logs**

---

## Security Checklist

Before going live:

- ✅ Change default admin password
- ✅ `NEXTAUTH_SECRET` is secure and secret
- ✅ Database credentials are not exposed
- ✅ `.env` file is in `.gitignore` (already done)
- ✅ Environment variables set in Vercel (not in code)
- ✅ Railway database has backups enabled

---

## Backup Strategy

### Database Backups

Railway automatically backs up your database, but you can also:

```bash
# Export database manually
npx prisma db pull
```

### Code Backups

Your code is on GitHub - that's your backup! ✅

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "Update: description"
git push

# 2. That's it! Vercel deploys automatically 🎉
```

---

**Your app is now live! 🎊**

Share your Vercel URL with your team and start tracking rentals!

