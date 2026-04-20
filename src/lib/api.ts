// FastAPI client — backend URL is user-configurable (localStorage)
import { defaultMetrics, ModelMetrics } from "./seismic-data";

const KEY = "seismic_api_url";
export const DEFAULT_API = "http://localhost:8000";

export function getApiUrl() {
  return localStorage.getItem(KEY) || DEFAULT_API;
}
export function setApiUrl(url: string) {
  localStorage.setItem(KEY, url.replace(/\/$/, ""));
}

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<{ data: T; live: boolean }> {
  try {
    const res = await fetch(`${getApiUrl()}${path}`, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    return { data, live: true };
  } catch (e) {
    if (fallback !== undefined) return { data: fallback, live: false };
    throw e;
  }
}

export async function getMetrics() {
  return safeFetch<ModelMetrics>("/metrics", undefined, defaultMetrics());
}

export async function trainModel(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return safeFetch<ModelMetrics>("/train", { method: "POST", body: fd }, mockTrain());
}

export interface PredictInput {
  magnitude: number; depth: number; latitude: number; longitude: number; rms: number; gap: number;
}
export interface PredictResult {
  risk: "low" | "medium" | "high";
  probability: number;
  scores: { low: number; medium: number; high: number };
}

export async function predict(input: PredictInput) {
  return safeFetch<PredictResult>("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }, mockPredict(input));
}

function mockTrain(): ModelMetrics {
  const m = defaultMetrics();
  // Slight randomness to feel "retrained"
  const jitter = (v: number) => Math.max(0.5, Math.min(0.999, v + (Math.random() - 0.5) * 0.04));
  return {
    ...m,
    accuracy: +jitter(m.accuracy).toFixed(3),
    precision: +jitter(m.precision).toFixed(3),
    recall: +jitter(m.recall).toFixed(3),
    f1: +jitter(m.f1).toFixed(3),
    trainedAt: new Date().toISOString(),
  };
}

function mockPredict(i: PredictInput): PredictResult {
  // Heuristic that mirrors XGBoost-style behaviour for demo
  const magScore = Math.min(1, Math.max(0, (i.magnitude - 2) / 6));
  const depthPenalty = i.depth > 300 ? 0.15 : 0;
  const rmsBoost = Math.min(0.2, i.rms * 0.1);
  const high = Math.min(0.99, magScore * 0.85 + rmsBoost - depthPenalty);
  const med = Math.min(0.99, 1 - Math.abs(magScore - 0.55) * 1.4);
  const low = Math.max(0.01, 1 - magScore - rmsBoost);
  const total = high + med + low;
  const scores = { low: low / total, medium: med / total, high: high / total };
  const risk = scores.high > scores.medium && scores.high > scores.low
    ? "high" : scores.medium > scores.low ? "medium" : "low";
  return { risk, probability: +scores[risk].toFixed(3), scores };
}
