// Synthetic USGS-style seismic dataset generator
export interface SeismicEvent {
  id: string;
  time: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  place: string;
  rms: number;
  gap: number;
  risk: "low" | "medium" | "high";
}

const PLACES = [
  "Off the coast of Honshu, Japan",
  "Central Alaska",
  "Northern California",
  "Sumatra, Indonesia",
  "Aleutian Islands",
  "Chile-Bolivia border",
  "Hindu Kush, Afghanistan",
  "Kermadec Islands",
  "Vanuatu region",
  "Mariana Islands region",
];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

export function generateSeismicData(n = 120): SeismicEvent[] {
  const events: SeismicEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const magnitude = +(rand(2.5, 7.8)).toFixed(1);
    const depth = +(rand(2, 650)).toFixed(1);
    const risk: SeismicEvent["risk"] =
      magnitude >= 6 ? "high" : magnitude >= 4.5 ? "medium" : "low";
    events.push({
      id: `eq_${i.toString().padStart(4, "0")}`,
      time: new Date(now - i * 1000 * 60 * rand(5, 240)).toISOString(),
      magnitude,
      depth,
      latitude: +rand(-60, 60).toFixed(3),
      longitude: +rand(-180, 180).toFixed(3),
      place: PLACES[Math.floor(Math.random() * PLACES.length)],
      rms: +rand(0.1, 1.4).toFixed(2),
      gap: +rand(20, 280).toFixed(0),
      risk,
    });
  }
  return events.sort((a, b) => +new Date(b.time) - +new Date(a.time));
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][]; // [[TN,FP],[FN,TP]]
  roc: { fpr: number; tpr: number }[];
  featureImportance: { feature: string; importance: number }[];
  trainedAt: string;
  samples: number;
}

export function defaultMetrics(): ModelMetrics {
  return {
    accuracy: 0.928,
    precision: 0.911,
    recall: 0.894,
    f1: 0.902,
    confusionMatrix: [[842, 38], [52, 468]],
    roc: Array.from({ length: 21 }, (_, i) => {
      const fpr = i / 20;
      const tpr = Math.min(1, Math.pow(fpr, 0.35) + 0.05);
      return { fpr: +fpr.toFixed(2), tpr: +tpr.toFixed(3) };
    }),
    featureImportance: [
      { feature: "magnitude", importance: 0.41 },
      { feature: "depth", importance: 0.22 },
      { feature: "rms", importance: 0.13 },
      { feature: "gap", importance: 0.10 },
      { feature: "latitude", importance: 0.08 },
      { feature: "longitude", importance: 0.06 },
    ],
    trainedAt: new Date().toISOString(),
    samples: 1400,
  };
}
