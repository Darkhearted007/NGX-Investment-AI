cat > src/pages/Dashboard.jsx << 'EOF'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { SignalOverlay, SignalSummaryBar } from "../components/SignalBadge";

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("ngx_stocks").select("*");
    setStocks(data || []);
  }

  async function runSignal(stock, useAI) {
    // placeholder for AI engine (next layer)
    const signal = Math.random() > 0.5 ? "BUY" : "HOLD";
    const confidence = Math.floor(Math.random() * 100);

    await supabase
      .from("ngx_stocks")
      .update({
        signal,
        confidence,
        ai_analysis: useAI ? "AI-driven market prediction model" : "Rule-based signal"
      })
      .eq("ticker", stock.ticker);

    load();
  }

  return (
    <div style={{
      background: "#0a0a0a",
      color: "#fff",
      minHeight: "100vh",
      padding: 20,
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#00ff88" }}>
        🚀 NGX Investment AI Terminal
      </h1>

      <SignalSummaryBar stocks={stocks} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12
      }}>
        {stocks.map((s) => (
          <div key={s.ticker} style={{
            background: "#111",
            padding: 15,
            borderRadius: 10,
            border: "1px solid #222"
          }}>
            <h2>{s.ticker}</h2>
            <p>{s.name}</p>
            <p>₦{s.price}</p>

            <SignalOverlay
              stock={s}
              onRunSignal={runSignal}
              loading={loading}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
EOF
