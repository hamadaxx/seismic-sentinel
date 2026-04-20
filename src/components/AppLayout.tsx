import { ReactNode, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { LivePulse, SeismicWave, StatusBadge } from "./Seismic";
import { getMetrics } from "@/lib/api";

export const AppLayout = ({ children }: { children?: ReactNode }) => {
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    getMetrics().then(({ live }) => mounted && setApiOnline(live));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <SeismicWave />
            <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Earthquake Detection Console
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge ok={apiOnline} />
            <LivePulse />
          </div>
        </header>
        <main className="flex-1 animate-fade-in p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};
