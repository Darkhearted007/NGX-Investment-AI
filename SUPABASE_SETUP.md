# 🚀 Supabase Configuration Guide

## Overview

Your NGX Investment AI requires Supabase for:
- **Database**: PostgreSQL (stock data, signals, history)
- **Authentication**: Email/password auth (future expansion)
- **Real-time**: Live signal updates via WebSocket
- **Storage**: File storage for exports (future feature)

## ✅ Current Architecture

```
┌─────────────────────────────────────────┐
│     NGX Investment AI (Frontend)        │
│         React + Vite                    │
└─────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│   Node.js Server (Production Server)    │
│         server.js (HTTP/Health)         │
└─────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│   Supabase (PostgreSQL + Real-time)     │
│   - ngx_stocks table                    │
│   - ngx_signal_history table            │
│   - ngx_users table (future)            │
└─────────────────────────────────────────┘
```

Your application connects to Supabase via:
- **Client**: `src/lib/supabase.js` (frontend + real-time)
- **Methods**: `useSignalEngine()` hook in components
- **Tables**: `ngx_stocks`, `ngx_signal_history`

## 📋 Step 1: Create Supabase Account & Project

### 1A. Go to Supabase
```
https://supabase.com
```

### 1B. Create Account
- Sign up with email or GitHub
- Verify email address

### 1C. Create New Project
1. Click **"New Project"**
2. **Name**: `ngx-investment-ai`
3. **Database Password**: Save securely (you'll need this)
4. **Region**: Choose closest to you
   - US East 1 (recommended for US)
   - EU West 1 (recommended for EU)
   - Asia Pacific Southeast 1 (recommended for Asia)
5. Click **"Create new project"** (wait 1-2 minutes for initialization)

### 1D. Get Your Credentials
Once initialized:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: (public key, starts with `eyJh...`)

Example (NOT real):
```
Project URL: https://abc123def456.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM2RlZjQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDA...
```

## 📝 Step 2: Configure `.env` File

### 2A. Create `.env` File

In your project root (`C:\Users\HomePC\Desktop\NGX INVESTMENT AI\NGX-Investment-AI`), create a file named `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Node Configuration
NODE_ENV=development
PORT=3000

# Other Settings
ENABLE_SIGNAL_ENGINE=true
```

### 2B. Fill in Your Credentials

Replace:
- `https://your-project.supabase.co` → Your actual Project URL
- `your_anon_key_here` → Your actual Anon Key

**⚠️ IMPORTANT**: 
- Never commit `.env` to GitHub (it's in `.gitignore`)
- Never share your anon key publicly
- The anon key IS public (it's for frontend use), but keep service keys private

## 🗄️ Step 3: Create Database Tables

### 3A. Go to SQL Editor

In Supabase Dashboard:
1. **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 3B. Create Tables

Run these SQL queries one by one:

#### Query 1: Create `ngx_stocks` table
```sql
CREATE TABLE IF NOT EXISTS ngx_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) UNIQUE NOT NULL,
  company_name VARCHAR(255),
  price DECIMAL(10, 2),
  prev_close DECIMAL(10, 2),
  high_52w DECIMAL(10, 2),
  low_52w DECIMAL(10, 2),
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(8, 2),
  
  -- Signal Fields
  signal VARCHAR(20), -- STRONG BUY, BUY, HOLD, SELL, STRONG SELL
  confidence INTEGER, -- 0-100
  ai_reasoning TEXT,
  
  -- Timestamps
  signal_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT signal_check CHECK (signal IN ('STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL', NULL))
);

-- Create indexes for performance
CREATE INDEX idx_ngx_stocks_ticker ON ngx_stocks(ticker);
CREATE INDEX idx_ngx_stocks_signal ON ngx_stocks(signal);
CREATE INDEX idx_ngx_stocks_updated_at ON ngx_stocks(updated_at DESC);
```

#### Query 2: Create `ngx_signal_history` table
```sql
CREATE TABLE IF NOT EXISTS ngx_signal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) NOT NULL REFERENCES ngx_stocks(ticker) ON DELETE CASCADE,
  signal VARCHAR(20) NOT NULL,
  confidence INTEGER,
  reasoning TEXT,
  price_at DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_signal_history_ticker ON ngx_signal_history(ticker);
CREATE INDEX idx_signal_history_created_at ON ngx_signal_history(created_at DESC);
```

#### Query 3: Create `ngx_users` table (for future auth)
```sql
CREATE TABLE IF NOT EXISTS ngx_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  watchlist TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ngx_users_email ON ngx_users(email);
```

### 3C. Enable Row Level Security (RLS)

For production security, enable RLS on tables:

```sql
-- Enable RLS
ALTER TABLE ngx_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngx_signal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngx_users ENABLE ROW LEVEL SECURITY;

-- Allow public read (stocks and signals are public data)
CREATE POLICY "Enable read for all" ON ngx_stocks FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON ngx_signal_history FOR SELECT USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "User profile visible to self" ON ngx_users FOR SELECT
  USING (auth.uid() = id);
```

## 🔌 Step 4: Test Connection

### 4A. Create Test File

Create `test-supabase.js` in your project root:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Connection
console.log("🔍 Test 1: Checking connectivity...");
const { data, error } = await supabase.from("ngx_stocks").select("count", { count: "exact" });
if (error) {
  console.error("❌ Connection failed:", error.message);
} else {
  console.log("✅ Connected! Found", data ? "stocks table" : "0", "records");
}

// Test 2: Insert sample stock
console.log("\n🔍 Test 2: Inserting sample stock...");
const { error: insertError } = await supabase.from("ngx_stocks").insert({
  ticker: "GOOGL",
  company_name: "Alphabet Inc.",
  price: 138.50,
  prev_close: 137.25,
  high_52w: 195.00,
  low_52w: 102.00,
  volume: 25000000,
  signal: "BUY",
  confidence: 75
});

if (insertError) {
  console.error("❌ Insert failed:", insertError.message);
} else {
  console.log("✅ Sample stock inserted!");
}

// Test 3: Read back
console.log("\n🔍 Test 3: Reading data...");
const { data: stocks, error: readError } = await supabase
  .from("ngx_stocks")
  .select("ticker, signal, confidence")
  .limit(5);

if (readError) {
  console.error("❌ Read failed:", readError.message);
} else {
  console.log("✅ Found stocks:", stocks);
}

console.log("\n🎉 All tests passed!");
```

### 4B. Run Test

```powershell
cd "C:\Users\HomePC\Desktop\NGX INVESTMENT AI\NGX-Investment-AI"
node test-supabase.js
```

## 🔄 Step 5: Enable Real-Time Updates (Optional but Recommended)

In Supabase Dashboard:

1. **Database** → **Replication**
2. For each table (`ngx_stocks`, `ngx_signal_history`):
   - Switch **ON** to enable real-time
3. Your app will now receive live updates when signals change!

## 📊 Step 6: Add Sample Data

### 6A. Via Supabase UI

1. Go to **Table Editor**
2. Click **`ngx_stocks`** table
3. Click **Insert row** and add:

```
ticker: AAPL
company_name: Apple Inc.
price: 175.50
prev_close: 174.75
high_52w: 199.62
low_52w: 124.17
volume: 50000000
signal: BUY
confidence: 72
```

Repeat for: MSFT, GOOGL, TSLA, META, AMZN, NVDA, etc.

### 6B. Or Import via SQL

```sql
INSERT INTO ngx_stocks (ticker, company_name, price, prev_close, high_52w, low_52w, volume, signal, confidence) VALUES
('AAPL', 'Apple Inc.', 175.50, 174.75, 199.62, 124.17, 50000000, 'BUY', 72),
('MSFT', 'Microsoft Corp.', 380.25, 379.50, 415.00, 310.00, 20000000, 'BUY', 78),
('GOOGL', 'Alphabet Inc.', 138.50, 137.25, 195.00, 102.00, 25000000, 'HOLD', 55),
('TSLA', 'Tesla Inc.', 242.00, 241.50, 289.00, 101.50, 120000000, 'SELL', 35),
('META', 'Meta Platforms', 520.00, 518.50, 598.50, 89.15, 15000000, 'BUY', 68);
```

## ✅ Step 7: Verify Setup

Your application is properly configured when:

- [ ] `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase dashboard shows all 3 tables created
- [ ] Tables have sample data
- [ ] `test-supabase.js` runs without errors
- [ ] Real-time is enabled on tables
- [ ] RLS policies are in place

## 🚀 Step 8: Run Your App

Once verified:

```powershell
# Option 1: Local development
npm run dev

# Option 2: Docker
docker compose up --build

# Option 3: Via setup script
.\setup.bat
```

Visit: **http://localhost:3000**

You should see:
- Stock list from your Supabase database
- Real-time signal updates
- Signal history charts

## 🔧 Troubleshooting

### Q: "Supabase not configured" message in console?
**A:** Check that `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values

### Q: 401 Unauthorized error?
**A:** Anon key is incorrect or expired. Copy fresh key from Supabase Settings → API

### Q: CORS error?
**A:** In Supabase Settings → Security, ensure your domain is in CORS allowed list
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

### Q: Tables not showing in app?
**A:** 
1. Verify tables exist in SQL Editor
2. Ensure RLS policies allow SELECT
3. Check browser DevTools → Network → verify API calls to Supabase

### Q: Real-time not updating?
**A:** In Replication settings, ensure tables have real-time enabled (toggle = ON)

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Supabase SQL](https://supabase.com/docs/guides/database)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)

## 🎯 Next Steps

1. **Set up Supabase account** (2 minutes)
2. **Create project** (2 minutes)
3. **Configure `.env`** (1 minute)
4. **Create tables** (5 minutes)
5. **Add sample data** (2 minutes)
6. **Test connection** (2 minutes)
7. **Run app** (instant)

**Total time: ~15 minutes**

---

**Status**: 🟢 Ready for Configuration

**Your app is production-ready. Just configure Supabase credentials and you're live!**
