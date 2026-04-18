-- ==============================================
-- NGX Investment AI - Database Setup
-- Run this in Supabase SQL Editor
-- ==============================================

-- ─── TABLE 1: ngx_stocks ───
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
  signal VARCHAR(20),
  confidence INTEGER,
  ai_reasoning TEXT,
  signal_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT signal_check CHECK (signal IN ('STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL', NULL))
);

CREATE INDEX idx_ngx_stocks_ticker ON ngx_stocks(ticker);
CREATE INDEX idx_ngx_stocks_signal ON ngx_stocks(signal);
CREATE INDEX idx_ngx_stocks_updated_at ON ngx_stocks(updated_at DESC);

-- ─── TABLE 2: ngx_signal_history ───
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

-- ─── TABLE 3: ngx_users ───
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

-- ─── ENABLE ROW LEVEL SECURITY ───
ALTER TABLE ngx_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngx_signal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngx_users ENABLE ROW LEVEL SECURITY;

-- Allow public read (stocks and signals are public data)
CREATE POLICY "Enable read for all" ON ngx_stocks FOR SELECT USING (true);
CREATE POLICY "Enable read for all" ON ngx_signal_history FOR SELECT USING (true);

-- User profile visible to self
CREATE POLICY "User profile visible to self" ON ngx_users FOR SELECT
  USING (auth.uid() = id);

-- ─── SAMPLE DATA ───
INSERT INTO ngx_stocks (ticker, company_name, price, prev_close, high_52w, low_52w, volume, signal, confidence) VALUES
('AAPL', 'Apple Inc.', 175.50, 174.75, 199.62, 124.17, 50000000, 'BUY', 72),
('MSFT', 'Microsoft Corp.', 380.25, 379.50, 415.00, 310.00, 20000000, 'BUY', 78),
('GOOGL', 'Alphabet Inc.', 138.50, 137.25, 195.00, 102.00, 25000000, 'HOLD', 55),
('TSLA', 'Tesla Inc.', 242.00, 241.50, 289.00, 101.50, 120000000, 'SELL', 35),
('META', 'Meta Platforms', 520.00, 518.50, 598.50, 89.15, 15000000, 'BUY', 68),
('NVDA', 'NVIDIA Corp.', 875.00, 872.50, 900.00, 540.00, 30000000, 'STRONG BUY', 85),
('AMZN', 'Amazon.com Inc.', 185.00, 184.50, 197.50, 100.00, 40000000, 'BUY', 65),
('NFLX', 'Netflix Inc.', 240.00, 239.00, 310.00, 156.00, 3000000, 'HOLD', 58);

-- Verify setup
SELECT count(*) as total_stocks FROM ngx_stocks;
