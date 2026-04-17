import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { computeSignal } from "../services/signalEngine";

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [history, setHistory] = useState([]);
  const [winRate, setWinRate] = useState(0);

  useEffect(() => {
    loadStocks();
    loadHistory();
  }, []);

  async function loadStocks() {
    const { data, error } = await supabase
      .from("ngx_stocks")
      .select("*");

    if (!error) setStocks(data || []);
  }

  async function loadHistory() {
    const { data, error } = await supabase
      .from("ngx_signal_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setHistory(data || []);
      calculateWinRate(data || []);
    }
  }

  function calculateWinRate(data) {
    const closed = data.filter(h => h.outcome !== "PENDING");
    const wins = closed.filter(h => h.outcome === "WIN");
    const rate = closed.length
      ? Math.round((wins.length / closed.length) * 100)
      : 0;

    setWinRate(rate);
  }

  async function runSignal(stock) {
    const result = computeSignal(stock);

    await supabase
      .from("ngx_stocks")
      .update({
        signal: result.signal,
        confidence: result.confidence,
        analysis: result.analysis,
        last_updated: new Date()
      })
      .eq("id", stock.id);

    await supabase
      .from("ngx_signal_history")
      .insert({
        stock: stock.ticker,
        price: stock.price,
        signal: result.signal,
        confidence: result.confidence
      });

    loadStocks();
    loadHistory();
  }

  async function updateOutcome(id, outcome) {
    await supabase
      .from("ngx_signal_history")
      .update({ outcome })
      .eq("id", id);

    loadHistory();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 NGX SIGNAL TERMINAL (LAYER 3)</h1>

      <h2>📊 Performance</h2>
      <p><strong>Win Rate:</strong> {winRate}%</p>
      <p><strong>Total Signals:</strong> {history.length}</p>

      <hr />

      <h2>📈 Live Signals</h2>

      {stocks.map(stock => (
        <div key={stock.id} style={{
          border: "1px solid #ccc",
          padding: 15,
          marginBottom: 10,
          borderRadius: 8
        }}>
          <h3>{stock.ticker}</h3>
          <p>Price: ₦{stock.price}</p>
          <p>Signal: <strong>{stock.signal || "NONE"}</strong></p>
          <p>Confidence: {stock.confidence || 0}%</p>
          <p>{stock.analysis || "No analysis yet"}</p>

          <button onClick={() => runSignal(stock)}>
            ⚡ Run Signal
          </button>
        </div>
      ))}

      <hr />

      <h2>🕒 Signal History</h2>

      {history.slice(0, 10).map(item => (
        <div key={item.id} style={{
          borderBottom: "1px solid #eee",
          padding: 10
        }}>
          <strong>{item.stock}</strong> | ₦{item.price} | {item.signal} | {item.confidence}%
          <br />
          <small>{new Date(item.created_at).toLocaleString()}</small>
          <br />
          Outcome:
          <button onClick={() => updateOutcome(item.id, "WIN")}> WIN </button>
          <button onClick={() => updateOutcome(item.id, "LOSS")}> LOSS </button>
          <button onClick={() => updateOutcome(item.id, "PENDING")}> RESET </button>
        </div>
      ))}
    </div>
  );
}
