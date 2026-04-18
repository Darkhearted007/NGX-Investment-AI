# 🎯 Supabase Setup Checklist

**Status**: 🔴 **NOT YET CONFIGURED** (Ready to configure)

Use this checklist to complete your Supabase setup in order.

## Phase 1: Account & Project (15 minutes)

- [ ] **1.1** Go to [supabase.com](https://supabase.com)
- [ ] **1.2** Create account (email or GitHub)
- [ ] **1.3** Verify email address
- [ ] **1.4** Create new project named `ngx-investment-ai`
- [ ] **1.5** Save database password securely (you'll need it)
- [ ] **1.6** Choose region closest to you
- [ ] **1.7** Wait for project to initialize (~2 minutes)
- [ ] **1.8** Go to **Settings** → **API**
- [ ] **1.9** Copy **Project URL** (e.g., `https://...supabase.co`)
- [ ] **1.10** Copy **Anon Key** (starts with `eyJh...`)

## Phase 2: Configure Application (5 minutes)

- [ ] **2.1** Create `.env` file in project root
- [ ] **2.2** Add `VITE_SUPABASE_URL=https://your-project.supabase.co`
- [ ] **2.3** Add `VITE_SUPABASE_ANON_KEY=your_anon_key_here`
- [ ] **2.4** Add `NODE_ENV=development`
- [ ] **2.5** Verify file is listed in `.gitignore` (DO NOT commit)
- [ ] **2.6** Save `.env` file

## Phase 3: Create Database Schema (5 minutes)

- [ ] **3.1** In Supabase Dashboard, go to **SQL Editor**
- [ ] **3.2** Create new query
- [ ] **3.3** Copy & run Query 1: `ngx_stocks` table
- [ ] **3.4** Copy & run Query 2: `ngx_signal_history` table
- [ ] **3.5** Copy & run Query 3: `ngx_users` table
- [ ] **3.6** Verify tables appear in **Table Editor**

## Phase 4: Enable Security Policies (3 minutes)

- [ ] **4.1** Go to **SQL Editor** in Supabase
- [ ] **4.2** Copy & run RLS enablement queries
- [ ] **4.3** Verify in **Authentication** → **RLS Policies**
- [ ] **4.4** Check that policies exist for each table

## Phase 5: Add Sample Data (3 minutes)

Choose ONE method:

### Method A: Via UI (Easiest)
- [ ] **5A.1** Go to **Table Editor**
- [ ] **5A.2** Click `ngx_stocks` table
- [ ] **5A.3** Click **Insert row**
- [ ] **5A.4** Add AAPL, MSFT, GOOGL, TSLA, META

### Method B: Via SQL
- [ ] **5B.1** Go to **SQL Editor**
- [ ] **5B.2** Copy & run INSERT statement from SUPABASE_SETUP.md
- [ ] **5B.3** Verify data appears in Table Editor

## Phase 6: Enable Real-Time (Optional but Recommended) (2 minutes)

- [ ] **6.1** Go to **Database** → **Replication**
- [ ] **6.2** Toggle ON for `ngx_stocks`
- [ ] **6.3** Toggle ON for `ngx_signal_history`
- [ ] **6.4** Toggle ON for `ngx_users`
- [ ] **6.5** Real-time updates now enabled ✨

## Phase 7: Validate Configuration (2 minutes)

### Auto-Validate (Recommended)
```powershell
cd "C:\Users\HomePC\Desktop\NGX INVESTMENT AI\NGX-Investment-AI"
node validate-supabase.js
```

- [ ] **7.1** Run validation script
- [ ] **7.2** All checks should show ✅
- [ ] **7.3** If any ❌, review validation output

### Manual Verification
Or verify manually:

- [ ] **7.4** `.env` file exists with correct credentials
- [ ] **7.5** All 3 tables exist in Supabase
- [ ] **7.6** Sample data is visible in tables
- [ ] **7.7** RLS policies are enabled
- [ ] **7.8** Real-time is enabled (optional)

## Phase 8: Test Application (5 minutes)

Choose ONE option:

### Option A: Local Development
```powershell
npm install
npm run dev
```
- [ ] **8A.1** Terminal shows "VITE v8..."
- [ ] **8A.2** Open http://localhost:3000
- [ ] **8A.3** See stocks from Supabase
- [ ] **8A.4** Signals show in dashboard

### Option B: Docker
```powershell
.\setup.bat
# or Docker command
docker compose up --build
```
- [ ] **8B.1** Docker builds successfully
- [ ] **8B.2** Open http://localhost:3000
- [ ] **8B.3** See stocks and signals

### Option C: Just Test Connection
```powershell
node validate-supabase.js
```
- [ ] **8C.1** All checks pass ✅

## 🎯 Success Criteria

You're done when:

- ✅ Supabase project is created
- ✅ `.env` file has correct credentials
- ✅ All 3 database tables exist and have data
- ✅ Application connects successfully
- ✅ Dashboard displays stock data
- ✅ Validation script shows all green checks

## 📚 Resources by Phase

**Phase 1-2**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Steps 1-2
**Phase 3**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Step 3
**Phase 4**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Step 3C
**Phase 5**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Step 6
**Phase 6**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Step 5
**Phase 7**: Run `validate-supabase.js`
**Phase 8**: Run `npm run dev` or `docker compose up`

## ⏱️ Total Time

| Phase | Time | Difficulty |
|-------|------|------------|
| 1. Account & Project | 15 min | Easy |
| 2. Configure App | 5 min | Easy |
| 3. Create Schema | 5 min | Easy |
| 4. Security | 3 min | Easy |
| 5. Sample Data | 3 min | Easy |
| 6. Real-Time | 2 min | Easy |
| 7. Validate | 2 min | Easy |
| 8. Test App | 5 min | Easy |
| **TOTAL** | **~40 min** | **All Easy** |

## ❓ Quick Troubleshooting

**Can't create Supabase account?**
→ Check spam folder for verification email or try GitHub login

**Can't find API credentials?**
→ Go to Supabase Dashboard → Settings → API (look for "anon key")

**Tables not created?**
→ Copy SQL from SUPABASE_SETUP.md exactly and run in SQL Editor

**App says "Supabase not configured"?**
→ Check `.env` has `VITE_` prefix (not `SUPABASE_`)

**Connection timeout?**
→ Verify `VITE_SUPABASE_URL` ends with `.supabase.co`

**Real-time not working?**
→ Toggle Replication ON in Supabase Dashboard

## 🚀 Next Action

**Start with Step 1.1 in Phase 1 above**

Or jump directly to resources:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete guide with SQL
- [validate-supabase.js](./validate-supabase.js) - Automatic checker
- [QUICK_FIX.md](./QUICK_FIX.md) - If you need to test without Supabase first

---

**Progress**: 🔴 Waiting for Supabase account creation

**Estimated time to launch**: ~40 minutes

**Difficulty**: Easy (all steps are straightforward, no coding required)

**You've got this!** 🚀
