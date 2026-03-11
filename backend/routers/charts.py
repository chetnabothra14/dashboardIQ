"""
POST /api/charts/regenerate
Regenerate specific server-side charts from already-processed data.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

from utils.chart_generator import (
    revenue_distribution_chart,
    correlation_heatmap,
    product_bar_chart,
    monthly_trend_chart,
    margin_boxplot,
)

router = APIRouter()


class RegenerateRequest(BaseModel):
    monthlyData: List[Dict]
    productData: List[Dict]
    forecastData: Optional[List[Dict]] = None
    chartType: str  # "all" | "distribution" | "heatmap" | "products" | "trend" | "margin"


@router.post("/charts/regenerate")
def regenerate_charts(req: RegenerateRequest):
    """Regenerate one or all Matplotlib/Seaborn charts from processed data."""
    charts = {}
    t = req.chartType

    try:
        if t in ("all", "distribution"):
            charts["revenueDistribution"] = revenue_distribution_chart(req.monthlyData)
        if t in ("all", "heatmap"):
            charts["correlationHeatmap"]  = correlation_heatmap(req.monthlyData)
        if t in ("all", "products"):
            charts["productBar"]          = product_bar_chart(req.productData)
        if t in ("all", "trend"):
            charts["monthlyTrend"]        = monthly_trend_chart(req.monthlyData, req.forecastData)
        if t in ("all", "margin"):
            charts["marginBoxplot"]       = margin_boxplot(req.productData)
    except Exception as e:
        raise HTTPException(500, f"Chart generation failed: {str(e)}")

    return {"charts": charts}
