import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Radar, ShieldAlert } from "lucide-react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predict, PredictInput, PredictResult } from "@/lib/api";
import { toast } from "sonner";

const FIELDS: { key: keyof PredictInput; label: string; min: number; max: number; step: number; default: number; unit?: string }[] = [
  { key: "magnitude", label: "Magnitude", min: 0, max: 10, step: 0.1, default: 5.4 },
  { key: "depth", label: "Depth", min: 0, max: 700, step: 1, default: 35, unit: "km" },
  { key: "latitude", label: "Latitude", min: -90, max: 90, step: 0.001, default: 37.78 },
  { key: "longitude", label: "Longitude", min: -180, max: 180, step: 0.001, default: -122.42 },
  { key: "rms", label: "RMS", min: 0, max: 3, step: 0.01, default: 0.6 },
  { key: "gap", label: "Azimuthal Gap", min: 0, max: 360, step: 1, default: 90, unit: "°" },
];

const Demo = () => {
  const [input, setInput] = useState<PredictInput>(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.default])) as unknown as PredictInput,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);

  const onPredict = async () => {
    setLoading(true);
    try {
      const { data, live } = await predict(input);
      setResult(data);
      if (!live) toast.message("Mock prediction (API offline)");
    } catch { toast.error("Prediction failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prediction Demo</h1>
        <p className="text-sm text-muted-foreground">Enter seismic features → XGBoost classifier returns risk level + probability.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Input Features" subtitle="Sensor reading" className="lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {f.label} {f.unit && <span className="opacity-60">({f.unit})</span>}
                </Label>
                <Input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={input[f.key]}
                  onChange={(e) => setInput((s) => ({ ...s, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="font-mono bg-input/60"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={onPredict}
            disabled={loading}
            className="mt-6 w-full gradient-primary text-primary-foreground glow-primary hover:opacity-90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            {loading ? "Analyzing seismic signature…" : "Predict Earthquake Risk"}
          </Button>
        </Panel>

        <Panel title="Prediction" subtitle="Model output" className="lg:col-span-2">
          {!result ? (
            <div className="grid h-64 place-items-center text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Awaiting input…
              </div>
            </div>
          ) : (
            <RiskDisplay result={result} />
          )}
        </Panel>
      </div>
    </div>
  );
};

const RiskDisplay = ({ result }: { result: PredictResult }) => {
  const cfg = {
    low: { color: "safe", icon: CheckCircle2, label: "SAFE", desc: "Low seismic risk detected" },
    medium: { color: "warning", icon: ShieldAlert, label: "MODERATE", desc: "Elevated activity — monitor closely" },
    high: { color: "danger", icon: AlertTriangle, label: "HIGH RISK", desc: "Significant earthquake potential" },
  }[result.risk];
  const Icon = cfg.icon;
  const colorClass = cfg.color === "safe" ? "text-safe border-safe/40 bg-safe/10"
    : cfg.color === "warning" ? "text-warning border-warning/40 bg-warning/10"
    : "text-danger border-danger/40 bg-danger/10 glow-danger";

  return (
    <div className="space-y-5">
      <div className={`relative rounded-lg border p-6 text-center ${colorClass}`}>
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-current/10">
          <Icon className="h-7 w-7" />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] opacity-80">Risk Level</div>
        <div className="mt-1 text-3xl font-bold tracking-tight">{cfg.label}</div>
        <div className="mt-1 text-sm opacity-80">{cfg.desc}</div>
        <div className="mt-4 font-mono text-xs">
          Confidence: <span className="font-semibold">{(result.probability * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {(["low", "medium", "high"] as const).map((k) => {
          const pct = result.scores[k] * 100;
          const barColor = k === "low" ? "bg-safe" : k === "medium" ? "bg-warning" : "bg-danger";
          return (
            <div key={k}>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{k}</span>
                <span>{pct.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Demo;
