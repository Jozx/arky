# Arky Deployment Guide

## 🚀 Complete Deployment Setup

You have deployed:
- **Database**: Neon (PostgreSQL)
- **Backend**: Render
- **Frontend**: Vercel

## ⚙️ Configuration Steps

### 1. Vercel (Frontend) Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

**Important**: Replace `your-render-backend-url` with your actual Render service URL.

Example:
```
VITE_API_URL=https://arky-api.onrender.com/api
```

### 2. Render (Backend) Environment Variables

Your Render service should already have these from deployment:

```
DATABASE_URL=your-neon-connection-string
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**CORS Configuration**: Make sure `FRONTEND_URL` matches your Vercel deployment URL exactly.

### 3. Neon (Database) Setup

If you haven't already, run the schema:

1. Go to Neon Console → SQL Editor
2. Copy the entire content of `arky-api/schema.sql`
3. Paste and execute

This will create:
- All tables
- All ENUMs
- All indexes
- **Admin user** with credentials:
  - Email: `admin@arky.com`
  - Password: `admin123`

⚠️ **Change this password immediately after first login!**

## 🔄 After Configuration Changes

### Redeploy Frontend (Vercel)

After adding the `VITE_API_URL` environment variable:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click "..." on the latest deployment
4. Click "Redeploy"

OR simply push a new commit to trigger automatic deployment.

### Redeploy Backend (Render)

If you changed any backend environment variables:

1. Go to Render Dashboard → Your Service
2. Click "Manual Deploy" → "Deploy latest commit"

## ✅ Verification Checklist

- [ ] Neon database has all tables (run schema.sql)
- [ ] Render backend has `DATABASE_URL` pointing to Neon
- [ ] Render backend has `FRONTEND_URL` pointing to Vercel
- [ ] Vercel frontend has `VITE_API_URL` pointing to Render
- [ ] Frontend redeployed after adding environment variable
- [ ] Can access frontend at Vercel URL
- [ ] Can login with admin credentials

## 🧪 Testing the Deployment

1. **Open your Vercel URL** (e.g., `https://arky.vercel.app`)
2. **Try to login** with:
   - Email: `admin@arky.com`
   - Password: `admin123`
3. **If successful**: Change the admin password immediately
4. **If failed**: Check browser console for errors

## 🐛 Common Issues

### "Network Error" or "ERR_BLOCKED_BY_CLIENT"

**Cause**: Frontend is still using localhost URL or environment variable not set.

**Fix**:
1. Verify `VITE_API_URL` is set in Vercel
2. Redeploy frontend after adding the variable
3. Clear browser cache and try again

### "CORS Error"

**Cause**: Backend CORS not configured for your Vercel domain.

**Fix**:
1. Check `FRONTEND_URL` in Render environment variables
2. Make sure it matches your Vercel URL exactly (no trailing slash)
3. Redeploy backend

### "Cannot connect to database"

**Cause**: `DATABASE_URL` not set or incorrect in Render.

**Fix**:
1. Get connection string from Neon dashboard
2. Update `DATABASE_URL` in Render
3. Redeploy backend

### "Admin login fails"

**Cause**: Admin user not created in database.

**Fix**:
1. Go to Neon SQL Editor
2. Run:
```sql
SELECT * FROM "User" WHERE email = 'admin@arky.com';
```
3. If empty, run the INSERT statement from schema.sql (lines 193-201)

## 📝 Environment Variables Reference

### Frontend (.env in Vercel)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend (.env in Render)
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
```

## 🔐 Security Checklist

- [ ] Changed admin password from default
- [ ] JWT_SECRET is a strong random string
- [ ] DATABASE_URL uses SSL connection
- [ ] CORS is configured only for your frontend domain
- [ ] Environment variables are not committed to git

## 📞 Need Help?

If you're still having issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend build errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
