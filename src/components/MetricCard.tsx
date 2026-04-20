import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export const MetricCard = ({
  label, value, icon: Icon, accent = "primary", hint,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  accent?: "primary" | "safe" | "warning" | "danger";
  hint?: string;
}) => {
  const accentClass = {
    primary: "text-primary",
    safe: "text-safe",
    warning: "text-warning",
    danger: "text-danger",
  }[accent];

  return (
    <div className="surface-card relative overflow-hidden rounded-lg border border-border p-5 transition-smooth hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
          <div className={`mt-2 font-mono text-3xl font-semibold ${accentClass}`}>{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-md bg-secondary ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
};
