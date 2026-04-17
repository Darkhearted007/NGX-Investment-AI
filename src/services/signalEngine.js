/**
 * NGX Signal Engine (Layer 2 Core Brain)
 * Pure JS (no React, no Supabase dependency)
 */

export function computeSignal(stock) {
  const {
    price = 0,
    prev_close = 0,
    high_52w = price,
    low_52w = price,
    volume = 0,
  } = stock;

  let score = 50;
  let reasons = [];

  // Prevent division errors
  if (!price || !prev_close) {
    return {
      signal: "HOLD",
      confidence: 40,
      reasoning: "Insufficient price data",
    };
  }

  // ── Price momentum ───────────────────────
  const change = ((price - prev_close) / prev_close) * 100;

  if (change > 2) {
    score += 15;
    reasons.push("Positive momentum above 2%");
  } else if (change < -2) {
    score -= 15;
    reasons.push("Negative momentum below -2%");
  }

  // ── 52W position ──────────────────────────
  const range = high_52w - low_52w || 1;
  const rangePosition = (price - low_52w) / range;

  if (rangePosition > 0.8) {
    score += 10;
    reasons.push("Trading near 52-week high");
  } else if (rangePosition < 0.2) {
    score += 10;
    reasons.push("Trading near 52-week low (accumulation zone)");
  }

  // ── Volume strength ───────────────────────
  if (volume > 1000000) {
    score += 5;
    reasons.push("High trading volume support");
  }

  // ── FINAL SIGNAL MAP ──────────────────────
  let signal = "HOLD";

  if (score >= 75) signal = "STRONG BUY";
  else if (score >= 60) signal = "BUY";
  else if (score <= 35) signal = "SELL";

  const confidence = Math.max(0, Math.min(100, score));

  return {
    signal,
    confidence,
    reasoning: reasons.join(" | ") || "Neutral market conditions",
  };
}
