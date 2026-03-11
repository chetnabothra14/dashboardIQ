"""
POST /api/forecast
Run forecasting independently on already-processed monthly data.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

from utils.forecaster import forecast_profit, compute_anomalies, growth_summary

router = APIRouter()


class ForecastRequest(BaseModel):
    monthlyData: List[Dict]
    periods: int = 3


@router.post("/forecast")
def run_forecast(req: ForecastRequest):
    """
    scikit-learn polynomial regression forecast.
    Returns forecasted rows + anomalies + growth summary.
    """
    forecast_data, r2 = forecast_profit(req.monthlyData, req.periods)
    anomalies    = compute_anomalies(req.monthlyData)
    growth_info  = growth_summary(req.monthlyData)

    return {
        "forecastData":  forecast_data,
        "forecastR2":    r2,
        "anomalies":     anomalies,
        "growthSummary": growth_info,
    }
