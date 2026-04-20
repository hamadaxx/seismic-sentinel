import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { Activity, AlertTriangle, Gauge, Target, Zap } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Panel } from "@/components/Panel";
import { generateSeismicData, ModelMetrics } from "@/lib/seismic-data";
import { getMetrics } from "@/lib/api";

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const data = useMemo(() => generateSeismicData(150), []);

  useEffect(() => { getMetrics().then(({ data }) => setMetrics(data)); }, []);

  const magBins = useMemo(() => {
    const bins = [
      { range: "2-3", count: 0 }, { range: "3-4", count: 0 }, { range: "4-5", count: 0 },
      { range: "5-6", count: 0 }, { range: "6-7", count: 0 }, { range: "7+", count: 0 },
    ];
    data.forEach((e) => {
      const i = Math.min(5, Math.max(0, Math.floor(e.magnitude) - 2));
      bins[i].count++;
    });
    return bins;
  }, [data]);

  const recent = data.slice(0, 8);

  if (!metrics) return <div className="font-mono text-muted-foreground">Loading metrics…</div>;

  const cm = metrics.confusionMatrix;
  const cmCells = [
    { label: "TN", v: cm[0][0], tone: "safe" },
    { label: "FP", v: cm[0][1], tone: "warning" },
    { label: "FN", v: cm[1][0], tone: "warning" },
    { label: "TP", v: cm[1][1], tone: "primary" },
  ] as const;
  const toneClass: Record<string, string> = {
    safe: "text-safe bg-safe/10 border-safe/30",
    warning: "text-warning bg-warning/10 border-warning/30",
    primary: "text-primary bg-primary/10 border-primary/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seismic Monitoring Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time overview · Last trained {new Date(metrics.trainedAt).toLocaleString()} · {metrics.samples} samples
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} icon={Target} accent="primary" />
        <MetricCard label="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} icon={Gauge} accent="safe" />
        <MetricCard label="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} icon={Activity} accent="warning" />
        <MetricCard label="F1 Score" value={metrics.f1.toFixed(3)} icon={Zap} accent="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="ROC Curve" subtitle="True vs False Positive Rate" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={metrics.roc} margin={{ left: -10, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="fpr" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="tpr" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Confusion Matrix" subtitle="Predicted vs Actual">
          <div className="grid grid-cols-2 gap-2">
            {cmCells.map((c) => (
              <div key={c.label} className={`rounded-md border p-4 text-center ${toneClass[c.tone]}`}>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">{c.label}</div>
                <div className="mt-1 font-mono text-2xl font-semibold">{c.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Feature Importance" subtitle="XGBoost gain ranking">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metrics.featureImportance} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis type="category" dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Magnitude Distribution" subtitle="Event count by Richter band">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={magBins}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {magBins.map((b, i) => (
                  <Cell key={i} fill={i >= 4 ? "hsl(var(--danger))" : i >= 2 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Depth vs Magnitude" subtitle="Event scatter (color = risk)">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ left: -10, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey="depth" name="Depth (km)" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis type="number" dataKey="magnitude" name="Magnitude" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <ZAxis range={[40, 200]} />
            <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
            <Scatter name="Low" data={data.filter((d) => d.risk === "low")} fill="hsl(var(--safe))" />
            <Scatter name="Medium" data={data.filter((d) => d.risk === "medium")} fill="hsl(var(--warning))" />
            <Scatter name="High" data={data.filter((d) => d.risk === "high")} fill="hsl(var(--danger))" />
          </ScatterChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Recent Seismic Events" subtitle="Live feed preview" action={
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{data.length} records</span>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Mag</th>
                <th className="pb-2 pr-4">Depth</th>
                <th className="pb-2 pr-4">Lat / Lon</th>
                <th className="pb-2 pr-4">Place</th>
                <th className="pb-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/40">
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{new Date(e.time).toLocaleTimeString()}</td>
                  <td className="py-2.5 pr-4 font-mono font-semibold">{e.magnitude.toFixed(1)}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{e.depth.toFixed(0)} km</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{e.latitude}, {e.longitude}</td>
                  <td className="py-2.5 pr-4 text-xs">{e.place}</td>
                  <td className="py-2.5">
                    <RiskPill risk={e.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

const RiskPill = ({ risk }: { risk: "low" | "medium" | "high" }) => {
  const cfg = {
    low: "border-safe/40 bg-safe/10 text-safe",
    medium: "border-warning/40 bg-warning/10 text-warning",
    high: "border-danger/40 bg-danger/10 text-danger glow-danger",
  }[risk];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cfg}`}>
      {risk === "high" && <AlertTriangle className="h-3 w-3" />} {risk}
    </span>
  );
};

export default Dashboard;
