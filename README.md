# SalesIQ — Full Stack Sales Analytics Dashboard
**React + FastAPI + Pandas + scikit-learn + Matplotlib + Seaborn**

---

## Project Structure

```
salesiq-fullstack/
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # FastAPI app + CORS setup
│   ├── requirements.txt              # Python dependencies
│   ├── routers/
│   │   ├── upload.py                 # POST /api/upload — file ingestion
│   │   ├── charts.py                 # POST /api/charts/regenerate
│   │   └── forecast.py              # POST /api/forecast
│   ├── utils/
│   │   ├── data_processor.py        # Pandas: read CSV/Excel/PDF, aggregate
│   │   ├── forecaster.py            # scikit-learn: polynomial regression + anomalies
│   │   └── chart_generator.py       # Matplotlib + Seaborn: server-side PNG charts
│   └── models/
│       └── schemas.py               # Pydantic data models
│
└── frontend/                         # React frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                   # Root layout + state
        ├── main.jsx                  # React entry point
        ├── context/
        │   └── ThemeContext.js       # Light/Dark theme tokens
        ├── utils/
        │   ├── api.js                # Fetch calls to FastAPI
        │   └── formatters.js        # INR formatters
        ├── hooks/
        │   └── useFileUpload.js     # Upload lifecycle hook
        ├── data/
        │   └── sampleData.js        # Fallback sample data
        ├── components/
        │   ├── ui/
        │   │   ├── SharedUI.jsx     # KPICard, Section, ServerChart, etc.
        │   │   └── ColumnMapper.jsx # Column mapping UI with data preview
        │   ├── charts/
        │   │   └── Heatmap.jsx      # Interactive heatmap
        │   └── tabs/
        │       ├── OverviewTab.jsx
        │       ├── HeatmapTab.jsx
        │       ├── ProductsTab.jsx
        │       ├── ForecastTab.jsx  # sklearn forecast + growth summary
        │       ├── PythonChartsTab.jsx  ← NEW: Matplotlib/Seaborn charts
        │       └── AIInsightsTab.jsx
        └── styles/
            └── global.css
```

---

## Setup & Running

### 1. Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs auto-available at: **http://localhost:8000/docs**

### 2. React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## How It Works

### File Upload Flow
1. User uploads CSV / Excel / PDF
2. **FastAPI** receives the file
3. **Pandas** reads and cleans the data (`read_csv`, `read_excel`, `pdfplumber`)
4. Column auto-detection maps headers to semantic fields
5. **Pandas groupby** aggregates monthly, product, and region data
6. **scikit-learn** runs Polynomial Regression for profit forecasting
7. **NumPy** z-score detects revenue anomalies
8. **Matplotlib + Seaborn** generate 5 server-side charts as base64 PNG
9. All results returned as JSON to React frontend
10. React renders Recharts (interactive) + server PNG charts side by side

### Python Libraries Used

| Library | Purpose |
|---|---|
| `fastapi` | REST API framework |
| `pandas` | Data reading, cleaning, groupby aggregation |
| `numpy` | Z-score anomaly detection, array operations |
| `scikit-learn` | Polynomial regression forecasting, R² scoring |
| `matplotlib` | Bar charts, line charts, trend overlays |
| `seaborn` | KDE histogram, correlation heatmap, box plot |
| `pdfplumber` | Extract tables from PDF files |
| `openpyxl` | Read .xlsx Excel files |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload file → full dashboard JSON |
| POST | `/api/upload/columns` | Get headers only (lightweight pre-scan) |
| POST | `/api/forecast` | Re-run sklearn forecast |
| POST | `/api/charts/regenerate` | Regenerate specific Matplotlib charts |
| GET  | `/docs` | Swagger UI — auto-generated API docs |

---

## Resume Bullet Points

**SALESIQ — Full Stack AI Sales Analytics** | React · FastAPI · Pandas · scikit-learn · Matplotlib · Seaborn

- **Real-time Analytics:** Built an end-to-end platform processing CSV/Excel/PDF files via a FastAPI backend with Pandas, delivering live business insights through 10+ interactive chart types.
- **ML Forecasting:** Implemented scikit-learn Polynomial Regression with R² scoring to project sales trends, and NumPy z-score analysis to automatically flag revenue anomalies.
- **Python Visualisation:** Generated server-side statistical charts (KDE histograms, correlation heatmaps, box plots) using Matplotlib and Seaborn, returned as base64 PNG to the React frontend.
- **AI Integration:** Embedded Anthropic Claude API for natural language querying of live data, enabling non-technical stakeholders to extract insights without SQL or coding expertise.
