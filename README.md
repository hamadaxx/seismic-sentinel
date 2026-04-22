# Seismic ML — Earthquake Detection Dashboard

A modern full-stack ML dashboard for earthquake detection. The frontend is a React + Vite + TailwindCSS app with a dark, "seismic monitoring" theme. It connects to an external **FastAPI + XGBoost** backend, and falls back to realistic synthetic data when the API is offline (Mock Mode).

---

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, Recharts, Framer Motion
- **Backend (external, you host):** FastAPI (Python), XGBoost, scikit-learn, pandas
- **Charts/Data:** Recharts, PapaParse (CSV parsing)

---

## Project Structure

```
.
├── src/                    # React frontend
│   ├── components/         # Layout, Sidebar, Panels, Seismic visuals
│   ├── pages/              # Dashboard, TrainModel, Demo, Settings
│   ├── lib/
│   │   ├── api.ts          # FastAPI client (configurable URL)
│   │   └── seismic-data.ts # Synthetic earthquake dataset (mock mode)
│   └── index.css           # Design tokens (HSL theme)
├── index.html
├── tailwind.config.ts
└── vite.config.ts
```

The FastAPI backend is **not included** in this repo — host it separately (Render, Railway, Fly.io, or locally) and point the frontend at its URL via the **Settings** page.

---

## 1. Run the Frontend

### Prerequisites
- Node.js 18+ (or Bun)
- npm, pnpm, or bun

### Install & Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:8080)
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

---

## 2. Connect a FastAPI Backend

The app expects these endpoints:

| Method | Path        | Body                          | Returns                              |
|--------|-------------|-------------------------------|--------------------------------------|
| GET    | `/metrics`  | —                             | `{ accuracy, precision, recall, f1, confusion_matrix, roc, feature_importance }` |
| POST   | `/train`    | `multipart/form-data` (`file`)| Updated metrics object               |
| POST   | `/predict`  | JSON: `{ magnitude, depth, latitude, longitude, ... }` | `{ risk: "low"\|"medium"\|"high", probability }` |

### Configure the URL

1. Start the app and open the **Settings** page in the sidebar.
2. Enter your FastAPI base URL (e.g. `http://localhost:8000` or `https://your-api.onrender.com`).
3. Click **Test Connection** → **Save**.

The URL is stored in `localStorage`. If the backend is unreachable, the app automatically uses **Mock Mode** with synthetic data.

### Minimal FastAPI starter

```python
# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd, joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Features(BaseModel):
    magnitude: float
    depth: float
    latitude: float
    longitude: float

@app.get("/metrics")
def metrics():
    return {"accuracy": 0.94, "precision": 0.92, "recall": 0.91, "f1": 0.915,
            "confusion_matrix": [[120, 8], [10, 95]],
            "roc": [{"fpr": 0, "tpr": 0}, {"fpr": 0.1, "tpr": 0.85}, {"fpr": 1, "tpr": 1}],
            "feature_importance": [{"feature": "magnitude", "importance": 0.42}]}

@app.post("/train")
async def train(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    X, y = df.drop("label", axis=1), df["label"]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2)
    model = XGBClassifier().fit(Xtr, ytr)
    joblib.dump(model, "model.pkl")
    pred = model.predict(Xte)
    return {"accuracy": accuracy_score(yte, pred),
            "precision": precision_score(yte, pred),
            "recall": recall_score(yte, pred),
            "f1": f1_score(yte, pred)}

@app.post("/predict")
def predict(f: Features):
    model = joblib.load("model.pkl")
    proba = float(model.predict_proba([[f.magnitude, f.depth, f.latitude, f.longitude]])[0][1])
    risk = "high" if proba > 0.7 else "medium" if proba > 0.4 else "low"
    return {"risk": risk, "probability": proba}
```

Run it:

```bash
pip install fastapi uvicorn xgboost scikit-learn pandas python-multipart joblib
uvicorn main:app --reload --port 8000
```

---

## 3. App Pages

- **Dashboard** — metrics, confusion matrix, ROC curve, feature importance, magnitude distribution, depth-vs-magnitude scatter.
- **Train Model** — upload a seismic CSV, trigger training, view updated metrics.
- **Demo** — input seismic features, get a risk prediction with color-coded alert (🟢 / 🟠 / 🔴).
- **Settings** — configure the FastAPI URL and test the connection.

---

## Scripts

```bash
npm run dev       # start dev server (port 8080)
npm run build     # production build
npm run preview   # preview build
npm run lint      # eslint
npm run test      # vitest
```

---

## Notes

- All colors use HSL semantic tokens defined in `src/index.css` and `tailwind.config.ts`.
- Mock Mode is automatic — no backend required to demo the UI.
- For production, host the FastAPI backend behind HTTPS and update the URL in **Settings**.
