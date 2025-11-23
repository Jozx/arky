# Render Backend - Environment Variables Checklist

## ✅ Required Environment Variables

Go to **Render Dashboard** → Your Service → **Environment** tab and verify these variables exist:

### 1. DATABASE_URL (CRITICAL)
```
postgresql://neondb_owner:npg_YiDeKgvX0u7T@ep-raspy-lake-ad0lzlcf-pooler.c-2.us-east-1.aws.neon.tech/arky_tracker_db?sslmode=require
```

### 2. NODE_ENV
```
production
```

### 3. JWT_SECRET (CRITICAL)
```
your-super-secret-jwt-key-min-32-characters-long
```
⚠️ **Must be at least 32 characters**. Generate a strong one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. PORT (Optional - Render sets this automatically)
```
3001
```

### 5. FRONTEND_URL (For CORS)
```
https://your-vercel-app.vercel.app
```

### 6. BACKEND_URL (For CORS)
```
https://arky-api.onrender.com
```

---

## 🔍 How to Check Render Logs

1. **Render Dashboard** → Your Service
2. Click **"Logs"** tab
3. Look for errors related to:
   - Database connection
   - JWT secret
   - Missing environment variables

### Common Error Messages:

**"JWT_SECRET is not defined"**
- Add JWT_SECRET environment variable

**"Cannot connect to database"**
- Check DATABASE_URL is correct
- Verify Neon database is accessible

**"User table does not exist"**
- Run schema.sql in Neon

---

## 🧪 Test Database Connection from Render

You can test if Render can connect to Neon:

1. Render Dashboard → Your Service → **Shell** tab
2. Run:
```bash
node -e "const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message))"
```

This will tell you if the database connection works.

---

## 📋 Quick Fix Steps

1. ✅ Verify all environment variables are set in Render
2. ✅ Check Render logs for specific error
3. ✅ Test database connection from Render shell
4. ✅ Redeploy if you added new environment variables

---

## 🆘 If Still Not Working

Share the error from Render logs and I can help debug it.
