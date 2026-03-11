from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class MonthlyRow(BaseModel):
    month: str
    revenue: float
    profit: float
    cost: float
    orders: float


class ProductRow(BaseModel):
    name: str
    revenue: float
    units: float
    margin: float


class RegionRow(BaseModel):
    region: str
    sales: float
    target: float
    growth: float


class ScatterPoint(BaseModel):
    ads: float
    revenue: float


class RadarPoint(BaseModel):
    product: str
    Q1: float
    Q3: float


class ForecastRow(BaseModel):
    month: str
    profit: float
    forecast: Optional[bool] = False


class KPIs(BaseModel):
    totalRevenue: float
    totalProfit: float
    totalOrders: float
    avgMargin: float


class DashboardData(BaseModel):
    monthlyData: List[MonthlyRow]
    productData: List[ProductRow]
    regionData:  List[RegionRow]
    scatterData: List[ScatterPoint]
    radarData:   List[RadarPoint]
    forecastData: List[ForecastRow]
    kpis: KPIs
    columnMapping: Dict[str, Optional[str]]
    rowCount: int
    fileName: str
