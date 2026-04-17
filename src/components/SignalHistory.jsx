import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignalHistory({ ticker }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!ticker) return;
    loadHistory();
  }, [ticker]);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("ngx_signal_history")
      .select("*")
      .eq("ticker", ticker)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log("HISTORY ERROR:", error);
      return;
    }

    setHistory(data || []);
  }

  return (
    <div style={{
      marginTop: 10,
      paddingTop: 10,
      borderTop: "1px solid rgba(255,255,255,0.05)"
    }}>
      <p style={{
        fontSize: 10,
        color: "#666",
        marginBottom: 6,
        letterSpacing: 1
      }}>
        SIGNAL HISTORY
      </p>

      {history.length === 0 ? (
        <p style={{ fontSize: 11, color: "#444" }}>
          No history yet
        </p>
      ) : (
        history.map((h) => (
          <div
            key={h.id}
            style={{
              fontSize: 11,
              padding: "4px 0",
              display: "flex",
              justifyContent: "space-between",
              color:
                h.signal === "BUY"
                  ? "#4ade80"
                  : h.signal === "SELL"
                  ? "#f87171"
                  : "#facc15"
            }}
          >
            <span>{h.signal}</span>
            <span>{h.confidence}%</span>
            <span style={{ color: "#666" }}>
              {new Date(h.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
