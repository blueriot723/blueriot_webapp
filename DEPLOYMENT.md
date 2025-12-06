# 🚀 blueriot mαtrιχ - Deployment Guide

This monorepo supports **three deployment targets** from a single repository:

1. **NODΞ Backend API** → Render.com
2. **PWA Frontend** → GitHub Pages
3. **Database** → Supabase

---

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Accounts created:
  - [GitHub](https://github.com) (for GitHub Pages)
  - [Render](https://render.com) (for backend API)
  - [Supabase](https://supabase.com) (for database)

---

## 🎯 Quick Start

```bash
# Clone the repository
git clone https://github.com/blueriot723/blueriot_webapp.git
cd blueriot_webapp

# Install all dependencies
npm run setup

# Start local development
npm run dev
```

---

## 1️⃣ Database Deployment (Supabase)

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Set project name: `blueriot-matrix`
4. Choose region (e.g., Europe - Frankfurt)
5. Set a strong database password
6. Wait for project to be ready (~2 minutes)

### Step 2: Apply Database Schema

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Copy/paste content from `database/schemas/database_ecosystem_final.sql`
4. Click **"Run"**
5. Apply NODΞ migrations in order:
   - Copy/paste `database/migrations/001_days.sql` → Run
   - Copy/paste `database/migrations/002_tickets.sql` → Run
   - Continue through `007_day_items.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Step 3: Get API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for backend deployment):
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_KEY) ⚠️ Keep this secret!

### Step 4: Enable Row Level Security (RLS)

```sql
-- Run in Supabase SQL Editor
ALTER TABLE tl_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_tastes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueriot_stay ENABLE ROW LEVEL SECURITY;

-- Create policies (example for tours)
CREATE POLICY "Users can view their own tours"
  ON tours FOR SELECT
  USING (auth.uid() = tl_id);

CREATE POLICY "Users can create their own tours"
  ON tours FOR INSERT
  WITH CHECK (auth.uid() = tl_id);
```

📚 **Full database documentation:** See `database/README.md`

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `blueriot723/blueriot_webapp`
4. Render will detect the `render.yaml` file automatically

### Step 2: Configure Environment Variables

In the Render Dashboard, set these environment variables:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://[YOUR-REF].supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
CORS_ORIGIN=https://blueriot723.github.io
```

⚠️ **Never commit API keys to Git!** Always use Render's environment variable system.

### Step 3: Deploy

Render will automatically deploy when you:
- Push to the `main` branch (auto-deploy enabled in `render.yaml`)
- Manually trigger from the Render Dashboard

**Build Command:** `cd nodex/backend && npm install`
**Start Command:** `cd nodex/backend && npm start`

### Step 4: Test Backend

Once deployed, your API will be available at:
```
https://blueriot-nodex-api.onrender.com
```

Test endpoints:
```bash
# Health check
curl https://blueriot-nodex-api.onrender.com/health

# Weather API
curl https://blueriot-nodex-api.onrender.com/api/weather/roma/2024-06-15

# Generate NODΞ day PDF
curl https://blueriot-nodex-api.onrender.com/api/pdf/nodex/day/[DAY-UUID]
```

### Manual Deployment (Alternative)

If you don't want to use `render.yaml`:

1. Click **"New"** → **"Web Service"**
2. Connect repository
3. Configure:
   - **Name:** blueriot-nodex-api
   - **Environment:** Node
   - **Build Command:** `cd nodex/backend && npm install`
   - **Start Command:** `cd nodex/backend && npm start`
   - **Plan:** Free (or Starter for production)

---

## 3️⃣ Frontend Deployment (GitHub Pages)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `blueriot723/blueriot_webapp`
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 2: Configure Frontend API Endpoint

The PWA (`index.html`) needs to know where the backend API is:

Edit `index.html` and update the API endpoint:

```javascript
// Find this line in index.html
const API_BASE_URL = 'https://blueriot-nodex-api.onrender.com';
```

### Step 3: Update CORS in Backend

Make sure `nodex/backend/app.js` has the correct CORS origin:

```javascript
app.use(cors({
  origin: 'https://blueriot723.github.io',
  credentials: true
}));
```

Or set the `CORS_ORIGIN` environment variable in Render.

### Step 4: Deploy

GitHub Pages automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Update frontend configuration"
git push origin main
```

Your PWA will be live at:
```
https://blueriot723.github.io/blueriot_webapp/
```

### Custom Domain (Optional)

To use a custom domain like `matrix.blueriot.com`:

1. In repository **Settings** → **Pages** → **Custom domain**
2. Enter your domain
3. Add these DNS records at your domain provider:
   ```
   Type: CNAME
   Name: matrix
   Value: blueriot723.github.io
   ```

---

## 🔄 Continuous Deployment Workflow

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... edit code ...

# 3. Test locally
cd nodex/backend
npm run dev

# 4. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 5. Create Pull Request on GitHub
# 6. Merge to main → Auto-deploys to Render + GitHub Pages
```

### Production Deployment

When you push to `main`:
1. ✅ GitHub Pages deploys frontend automatically
2. ✅ Render detects changes and deploys backend automatically
3. ⚠️ Database migrations must be applied manually (for safety)

---

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install:all

# Start backend dev server (with hot reload)
npm run backend:dev

# Start backend production mode
npm run backend:start

# Serve frontend locally (Python)
npm run frontend:serve

# Deploy to Render (if git remote configured)
npm run deploy:render

# Deploy to GitHub Pages
npm run deploy:pages
```

---

## 📦 Repository Structure

```
blueriot_webapp/
├── index.html                 # PWA Frontend (→ GitHub Pages)
├── css/, js/, images/         # Frontend assets
├── nodex/
│   └── backend/               # NODΞ API (→ Render)
│       ├── server.js          # Entry point
│       ├── app.js             # Express app
│       ├── routes/            # API routes
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic
│       └── lib/               # Utilities & parsers
├── database/                  # Database (→ Supabase)
│   ├── schemas/               # Full schemas
│   ├── migrations/            # Incremental migrations
│   └── seed/                  # Test data
├── package.json               # Root package (monorepo scripts)
├── render.yaml                # Render deployment config
└── DEPLOYMENT.md              # This file
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Enable Row Level Security (RLS) on all Supabase tables
- [ ] Set strong database password
- [ ] Use `service_role` key only on backend (never expose to frontend)
- [ ] Enable HTTPS only (both Render and GitHub Pages use HTTPS by default)
- [ ] Set proper CORS origins
- [ ] Add rate limiting to API endpoints
- [ ] Enable API authentication (JWT tokens)
- [ ] Review Supabase Auth policies
- [ ] Add environment variable validation
- [ ] Enable Render health checks

---

## 🧪 Testing Deployment

### Test Backend API

```bash
# Health check
curl https://blueriot-nodex-api.onrender.com/health

# Weather endpoint
curl https://blueriot-nodex-api.onrender.com/api/weather/roma/2024-06-15

# Day items
curl https://blueriot-nodex-api.onrender.com/api/day-items/[DAY-UUID]

# Generate PDF
curl -O https://blueriot-nodex-api.onrender.com/api/pdf/nodex/day/[DAY-UUID]
```

### Test Frontend PWA

1. Open https://blueriot723.github.io/blueriot_webapp/
2. Check browser console for errors
3. Test API connectivity
4. Verify PWA install prompt (mobile)

### Test Database

```sql
-- Run in Supabase SQL Editor
SELECT * FROM tl_users LIMIT 5;
SELECT * FROM tours LIMIT 5;
SELECT * FROM tour_days LIMIT 5;
```

---

## 🆘 Troubleshooting

### Backend Not Deploying

**Error: "Build failed"**
- Check Render logs: Dashboard → Service → Logs
- Verify `package.json` exists in `nodex/backend/`
- Ensure Node.js version matches (18+)

**Error: "Module not found"**
- Make sure build command includes: `cd nodex/backend && npm install`
- Check that all imports use `.js` extensions (ES modules)

### Frontend Not Loading

**Error: "404 Not Found"**
- GitHub Pages serves from `main` branch root
- Verify `index.html` is at repository root
- Check Settings → Pages → Source is set correctly

**Error: "CORS error"**
- Update `CORS_ORIGIN` in Render environment variables
- Verify backend `app.js` CORS configuration

### Database Connection Issues

**Error: "connection refused"**
- Check Supabase project is active (not paused)
- Verify `SUPABASE_URL` environment variable
- Ensure `SUPABASE_SERVICE_KEY` is correct

**Error: "permission denied"**
- Review Row Level Security policies
- Grant proper permissions to `authenticated` role

---

## 📞 Support & Resources

- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Pages Docs:** https://docs.github.com/pages

---

## 🎉 Success!

Once all three services are deployed, you'll have:

- ✅ **Backend API** running on Render (auto-scales, always online)
- ✅ **Database** on Supabase (PostgreSQL, real-time, auth)
- ✅ **Frontend PWA** on GitHub Pages (free, fast CDN)

**All from one Git repository!** 🚀

---

*Last updated: 2024-11-30*
*blueriot mαtrιχ v1.0*
