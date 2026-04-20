import { Activity } from "lucide-react";

export const SeismicWave = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-end gap-[3px] h-6 ${className}`} aria-hidden>
    {[0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.95, 0.5, 0.25].map((_, i) => (
      <span
        key={i}
        className="wave-bar w-[3px] rounded-full bg-primary"
        style={{ height: "100%", animationDelay: `${i * 0.08}s` }}
      />
    ))}
  </div>
);

export const LivePulse = ({ label = "LIVE" }: { label?: string }) => (
  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary">
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
    {label}
  </span>
);

export const StatusBadge = ({ ok }: { ok: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
      ok
        ? "border-safe/40 bg-safe/10 text-safe"
        : "border-warning/40 bg-warning/10 text-warning"
    }`}
  >
    <Activity className="h-3 w-3" />
    {ok ? "API Online" : "Mock Mode"}
  </span>
);
