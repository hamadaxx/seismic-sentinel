import { useState } from "react";
import { Save, Server } from "lucide-react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_API, getApiUrl, getMetrics, setApiUrl } from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
  const [url, setUrl] = useState(getApiUrl());
  const [testing, setTesting] = useState(false);

  const save = () => { setApiUrl(url); toast.success("API URL saved"); };
  const test = async () => {
    setTesting(true);
    setApiUrl(url);
    const { live } = await getMetrics();
    toast[live ? "success" : "error"](live ? "Backend reachable ✓" : "Could not reach backend");
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Settings</h1>
        <p className="text-sm text-muted-foreground">Connect this dashboard to your FastAPI backend.</p>
      </div>

      <Panel title="FastAPI Backend" subtitle="Base URL for /train, /predict, /metrics">
        <div className="space-y-4">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Backend URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={DEFAULT_API}
              className="mt-1.5 font-mono bg-input/60"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              CORS must allow this origin. Endpoints expected: <code className="font-mono text-primary">POST /train</code> (multipart),
              {" "}<code className="font-mono text-primary">POST /predict</code> (JSON),
              {" "}<code className="font-mono text-primary">GET /metrics</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} className="gradient-primary text-primary-foreground">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button onClick={test} disabled={testing} variant="outline">
              <Server className="h-4 w-4" /> {testing ? "Testing…" : "Test connection"}
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Expected Backend Contract" subtitle="Sample FastAPI signatures">
        <pre className="overflow-x-auto rounded-md border border-border bg-secondary/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`@app.get("/metrics")
def metrics() -> ModelMetrics: ...

@app.post("/train")
async def train(file: UploadFile) -> ModelMetrics: ...

@app.post("/predict")
def predict(req: PredictInput) -> PredictResult: ...

# When the backend is offline the dashboard
# falls back to realistic mock responses.`}
        </pre>
      </Panel>
    </div>
  );
};

export default Settings;
