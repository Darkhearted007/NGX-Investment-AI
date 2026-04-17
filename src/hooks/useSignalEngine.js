import { useState, useCallback } from "react";
import { runSignalBatch, generateAISignal, computeSignal } from "../services/signalEngine";

export function useSignalEngine(supabase, setStocks) {

  const [loadingTicker, setLoadingTicker] = useState(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const patchStock = useCallback(async (ticker, data) => {
    await supabase
      .from("ngx_stocks")
      .update(data)
      .eq("ticker", ticker);

    const { data: stock } = await supabase
      .from("ngx_stocks")
      .select("price")
      .eq("ticker", ticker)
      .single();

    await supabase.from("ngx_signal_history").insert({
      ticker,
      signal: data.signal,
      confidence: data.confidence,
      reasoning: data.ai_reasoning,
      price_at: stock?.price
    });

    setStocks(prev =>
      prev.map(s => s.ticker === ticker ? { ...s, ...data } : s)
    );
  }, [supabase, setStocks]);

  const runSignal = useCallback(async (stock, useAI = false) => {
    setLoadingTicker(stock.ticker);

    try {
      const result = useAI
        ? await generateAISignal(stock)
        : computeSignal(stock);

      await patchStock(stock.ticker, {
        signal: result.signal,
        confidence: result.confidence,
        ai_reasoning: result.reasoning,
        signal_generated_at: new Date().toISOString()
      });

    } catch (err) {
      console.error(err);
    }

    setLoadingTicker(null);
  }, [patchStock]);

  const runBatch = useCallback(async (stocks, useAI = false) => {
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: stocks.length });

    await runSignalBatch(stocks, patchStock, {
      useAI,
      delayMs: 300,
      onProgress: (ticker, result, index, total) => {
        setBatchProgress({ done: index + 1, total });
      }
    });

    setBatchRunning(false);
  }, [patchStock]);

  return {
    runSignal,
    runBatch,
    loadingTicker,
    batchRunning,
    batchProgress
  };
}
