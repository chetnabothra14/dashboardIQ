"""
Sales forecasting using scikit-learn.
Uses LinearRegression on historical monthly profit to project next N periods.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from typing import List, Dict


MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]


def forecast_profit(monthly_data: List[Dict], periods: int = 3) -> List[Dict]:
    """
    Takes historical monthly data and appends `periods` AI-forecasted rows.
    Uses Polynomial Regression (degree 2) for a smoother, more realistic curve.

    Returns the last 6 historical months + forecasted periods.
    """
    if len(monthly_data) < 2:
        return monthly_data

    profits = [row["profit"] for row in monthly_data]
    X = np.arange(len(profits)).reshape(-1, 1)
    y = np.array(profits)

    # Polynomial regression degree 2 — captures seasonal curves better than linear
    model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
    model.fit(X, y)

    # Score for confidence
    r2 = model.score(X, y)

    # Forecast next N periods
    future_X = np.arange(len(profits), len(profits) + periods).reshape(-1, 1)
    predicted = model.predict(future_X)

    # Build output: last 6 historical + forecasted
    base = monthly_data[-6:]
    result = [{"month": r["month"], "profit": round(r["profit"], 2), "forecast": False}
              for r in base]

    for i, pred in enumerate(predicted):
        result.append({
            "month":    f"→{i+1}",
            "profit":   round(max(float(pred), 0), 2),
            "forecast": True,
        })

    return result, round(r2 * 100, 1)


def compute_anomalies(monthly_data: List[Dict]) -> List[Dict]:
    """
    Uses statistical z-score (via numpy) to flag anomalous revenue months.
    Any month with |z-score| > 1.5 is flagged.
    """
    if len(monthly_data) < 3:
        return []

    revenues = np.array([r["revenue"] for r in monthly_data])
    mean  = revenues.mean()
    std   = revenues.std()

    if std == 0:
        return []

    anomalies = []
    for row in monthly_data:
        z = (row["revenue"] - mean) / std
        if abs(z) > 1.5:
            direction = "spike" if z > 0 else "drop"
            pct       = abs(round((row["revenue"] - mean) / mean * 100, 1))
            anomalies.append({
                "month":  row["month"],
                "z_score": round(float(z), 2),
                "direction": direction,
                "pct_deviation": pct,
                "severity": "high" if abs(z) > 2.5 else "medium",
                "msg": f"Revenue {direction} of {pct}% vs average in {row['month']}",
            })

    return anomalies


def growth_summary(monthly_data: List[Dict]) -> Dict:
    """Compute MoM and overall growth metrics using numpy."""
    if len(monthly_data) < 2:
        return {}

    revenues = np.array([r["revenue"] for r in monthly_data])
    mom_growth = np.diff(revenues) / revenues[:-1] * 100  # Month-over-Month %

    return {
        "avgMoMGrowth":   round(float(mom_growth.mean()), 2),
        "maxMoMGrowth":   round(float(mom_growth.max()),  2),
        "minMoMGrowth":   round(float(mom_growth.min()),  2),
        "overallGrowth":  round(float((revenues[-1] - revenues[0]) / revenues[0] * 100), 2),
        "peakMonth":      monthly_data[int(np.argmax(revenues))]["month"],
        "lowestMonth":    monthly_data[int(np.argmin(revenues))]["month"],
    }
