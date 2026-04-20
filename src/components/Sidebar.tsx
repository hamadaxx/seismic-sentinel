import { NavLink } from "react-router-dom";
import { LayoutDashboard, Brain, FlaskConical, Radio, Settings } from "lucide-react";
import { SeismicWave } from "./Seismic";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/train", label: "Train Model", icon: Brain },
  { to: "/demo", label: "Predict Demo", icon: FlaskConical },
  { to: "/settings", label: "API Settings", icon: Settings },
];

export const Sidebar = () => (
  <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
    <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
      <div className="relative grid h-10 w-10 place-items-center rounded-lg gradient-primary glow-primary">
        <Radio className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Seismic Net</div>
        <div className="font-semibold leading-tight text-sidebar-foreground">EQ Detect</div>
      </div>
    </div>

    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-smooth ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary pl-[10px]"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="border-t border-sidebar-border p-4">
      <div className="rounded-md bg-sidebar-accent/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sensor Feed</span>
          <SeismicWave />
        </div>
        <div className="font-mono text-xs text-sidebar-foreground/70">v1.0 · XGBoost</div>
      </div>
    </div>
  </aside>
);
