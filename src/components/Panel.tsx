import { ReactNode } from "react";

export const Panel = ({
  title, subtitle, action, children, className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`surface-card rounded-lg border border-border ${className}`}>
    <header className="flex items-center justify-between border-b border-border px-5 py-3">
      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);
