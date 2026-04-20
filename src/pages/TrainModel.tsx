import { useState } from "react";
import Papa from "papaparse";
import { Brain, CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { trainModel } from "@/lib/api";
import { ModelMetrics } from "@/lib/seismic-data";
import { toast } from "sonner";

const TrainModel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState<ModelMetrics | null>(null);

  const onFile = (f: File | null) => {
    setFile(f); setResult(null); setPreview(null);
    if (!f) return;
    Papa.parse(f, {
      preview: 6,
      complete: (res) => {
        const rows = res.data as string[][];
        if (!rows.length) return;
        setPreview({ headers: rows[0], rows: rows.slice(1) });
      },
    });
  };

  const onTrain = async () => {
    if (!file) { toast.error("Upload a CSV first"); return; }
    setTraining(true);
    try {
      const { data, live } = await trainModel(file);
      setResult(data);
      toast.success(live ? "Model retrained on backend" : "Trained (mock — API offline)");
    } catch (e) {
      toast.error("Training failed");
    } finally { setTraining(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Train Model</h1>
        <p className="text-sm text-muted-foreground">Upload a seismic CSV → backend preprocesses, trains XGBoost, returns updated metrics.</p>
      </div>

      <Panel title="Dataset Upload" subtitle="CSV file with seismic features">
        <label className="surface-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-10 text-center transition-smooth hover:border-primary/60">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{file ? file.name : "Drop CSV or click to browse"}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "magnitude, depth, latitude, longitude, rms, gap, label"}
            </div>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {preview && (
          <div className="mt-5 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => (
                  <tr key={i} className="border-t border-border/50">
                    {r.map((c, j) => <td key={j} className="px-3 py-2 font-mono">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-muted-foreground">
            {file ? <span className="inline-flex items-center gap-1.5"><FileUp className="h-3 w-3" /> Ready to train</span> : "No dataset selected"}
          </div>
          <Button
            onClick={onTrain}
            disabled={!file || training}
            className="gradient-primary text-primary-foreground glow-primary hover:opacity-90"
          >
            {training ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {training ? "Training XGBoost…" : "Train Model"}
          </Button>
        </div>
      </Panel>

      {result && (
        <Panel title="Training Result" subtitle="Updated evaluation metrics">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-safe/40 bg-safe/10 px-3 py-1 text-safe">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-mono text-xs">Trained at {new Date(result.trainedAt).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { l: "Accuracy", v: `${(result.accuracy * 100).toFixed(1)}%` },
              { l: "Precision", v: `${(result.precision * 100).toFixed(1)}%` },
              { l: "Recall", v: `${(result.recall * 100).toFixed(1)}%` },
              { l: "F1", v: result.f1.toFixed(3) },
            ].map((m) => (
              <div key={m.l} className="rounded-md border border-border bg-secondary/30 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
                <div className="mt-1 font-mono text-2xl font-semibold text-primary">{m.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default TrainModel;
