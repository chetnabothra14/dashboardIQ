"""
POST /api/upload
Accepts CSV, Excel (.xlsx/.xls), or PDF.
Processes with Pandas and returns full dashboard-ready JSON.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import json

from utils.data_processor import read_file, detect_columns, transform_dataframe
from utils.forecaster     import forecast_profit, compute_anomalies, growth_summary
from utils.chart_generator import (
    revenue_distribution_chart,
    correlation_heatmap,
    product_bar_chart,
    monthly_trend_chart,
    margin_boxplot,
)

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    col_map_override: Optional[str] = Form(None),  # JSON string of user-confirmed mapping
):
    """
    Main upload endpoint.
    1. Read file into Pandas DataFrame
    2. Auto-detect or use provided column mapping
    3. Aggregate data (monthly, product, region)
    4. Run scikit-learn forecast
    5. Generate Matplotlib/Seaborn charts
    6. Return everything as JSON
    """
    allowed = {"csv", "xlsx", "xls", "pdf"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"File type .{ext} not supported. Use CSV, Excel, or PDF.")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(413, "File too large. Max 20MB.")

    # ── Step 1: Read into DataFrame ──────────────────────────────────────────
    try:
        df = read_file(content, file.filename)
    except Exception as e:
        raise HTTPException(422, f"Could not read file: {str(e)}")

    if df.empty or len(df) < 1:
        raise HTTPException(422, "File appears to be empty or has no data rows.")

    headers = df.columns.tolist()

    # ── Step 2: Column mapping ───────────────────────────────────────────────
    if col_map_override:
        try:
            col_map = json.loads(col_map_override)
        except Exception:
            col_map = detect_columns(headers)
    else:
        col_map = detect_columns(headers)

    # ── Step 3: Transform with Pandas ────────────────────────────────────────
    try:
        result = transform_dataframe(df, col_map)
    except ValueError as e:
        raise HTTPException(422, str(e))

    # ── Step 4: Forecast with scikit-learn ───────────────────────────────────
    forecast_result, r2_score = forecast_profit(result["monthlyData"])
    anomalies   = compute_anomalies(result["monthlyData"])
    growth_info = growth_summary(result["monthlyData"])

    # ── Step 5: Generate Matplotlib/Seaborn charts ───────────────────────────
    charts = {}
    try:
        charts["revenueDistribution"] = revenue_distribution_chart(result["monthlyData"])
        charts["correlationHeatmap"]  = correlation_heatmap(result["monthlyData"])
        charts["productBar"]          = product_bar_chart(result["productData"])
        charts["monthlyTrend"]        = monthly_trend_chart(result["monthlyData"], forecast_result)
        charts["marginBoxplot"]       = margin_boxplot(result["productData"])
    except Exception as e:
        charts["error"] = str(e)

    # ── Step 6: Return full payload ───────────────────────────────────────────
    return {
        **result,
        "forecastData":  forecast_result,
        "forecastR2":    r2_score,
        "anomalies":     anomalies,
        "growthSummary": growth_info,
        "charts":        charts,
        "columnMapping": col_map,
        "headers":       headers,
        "rowCount":      result["rowCount"],
        "fileName":      file.filename,
    }


@router.post("/upload/columns")
async def get_columns(file: UploadFile = File(...)):
    """
    Lightweight endpoint — reads only headers from file.
    Used by the frontend column-mapping UI before full processing.
    """
    content = await file.read()
    ext     = file.filename.rsplit(".", 1)[-1].lower()
    try:
        df      = read_file(content, file.filename)
        headers = df.columns.tolist()
        sample  = df.head(3).to_dict(orient="records")
        return {
            "headers":  headers,
            "detected": detect_columns(headers),
            "sample":   sample,
        }
    except Exception as e:
        raise HTTPException(422, str(e))
