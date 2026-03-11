from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, charts, forecast

app = FastAPI(
    title="SalesIQ API",
    description="AI-powered sales analytics backend — processes CSV/Excel/PDF and returns dashboard-ready data.",
    version="1.0.0",
)

# Allow React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router,   prefix="/api", tags=["Upload"])
app.include_router(charts.router,   prefix="/api", tags=["Charts"])
app.include_router(forecast.router, prefix="/api", tags=["Forecast"])


@app.get("/")
def root():
    return {"status": "SalesIQ API running", "docs": "/docs"}
