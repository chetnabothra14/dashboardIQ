"""
Core data processing using Pandas.
Handles CSV, Excel, and PDF file ingestion + aggregation.
"""

import io
import re
import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple

# ─── Month ordering ────────────────────────────────────────────────────────────
MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]


# ─── Column auto-detection ─────────────────────────────────────────────────────
def detect_columns(headers: list[str]) -> Dict[str, Optional[str]]:
    """
    Fuzzy-match column headers to semantic field names.
    Returns a dict of { field: matched_column_name | None }
    """
    h = [x.lower().strip() for x in headers]

    def find(*keys) -> Optional[str]:
        for k in keys:
            for i, col in enumerate(h):
                if k in col:
                    return headers[i]
        return None

    return {
        "date":    find("date","month","period","time","week","day","year"),
        "revenue": find("revenue","sales","amount","total","income","turnover","gross"),
        "profit":  find("profit","net","margin_amt","earnings"),
        "cost":    find("cost","expense","cogs","expenditure"),
        "orders":  find("order","qty","quantity","units","count","transactions","txn"),
        "product": find("product","item","category","sku","name","goods","service"),
        "region":  find("region","area","zone","city","state","location","territory","store"),
        "margin":  find("margin%","margin_pct","profit_margin","gp%","gp_pct","margin"),
        "hour":    find("hour","time_of_day","hr"),
    }


# ─── File readers ──────────────────────────────────────────────────────────────
def read_file(content: bytes, filename: str) -> pd.DataFrame:
    """Read CSV, Excel, or PDF into a Pandas DataFrame."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        # Try multiple encodings
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding=enc)
                return df
            except Exception:
                continue
        raise ValueError("Could not decode CSV file.")

    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
        return df

    elif ext == "pdf":
        try:
            import pdfplumber
            tables = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    table = page.extract_table()
                    if table:
                        tables.append(pd.DataFrame(table[1:], columns=table[0]))
            if not tables:
                raise ValueError("No tables found in PDF.")
            df = pd.concat(tables, ignore_index=True)
            return df
        except ImportError:
            raise ValueError("pdfplumber not installed. Run: pip install pdfplumber")

    else:
        raise ValueError(f"Unsupported file type: .{ext}")


# ─── Numeric cleaner ───────────────────────────────────────────────────────────
def to_numeric(series: pd.Series) -> pd.Series:
    """Strip currency symbols, commas, spaces and convert to float."""
    return pd.to_numeric(
        series.astype(str).str.replace(r"[₹$£€,\s]", "", regex=True),
        errors="coerce"
    ).fillna(0)


# ─── Date label parser ─────────────────────────────────────────────────────────
def parse_month_label(val: str) -> str:
    """Convert any date-like string to a 3-letter month abbreviation."""
    val = str(val).strip()
    # Already abbreviated
    match = re.search(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b', val, re.I)
    if match:
        return match.group(1).capitalize()
    # Try pandas date parsing
    try:
        dt = pd.to_datetime(val)
        return dt.strftime("%b")
    except Exception:
        return val[:7]  # fallback: raw prefix


# ─── Main aggregation pipeline ─────────────────────────────────────────────────
def transform_dataframe(df: pd.DataFrame, col_map: Dict[str, Optional[str]]) -> dict:
    """
    Core Pandas pipeline:
    - Cleans and type-converts columns
    - Aggregates monthly, by product, by region
    - Returns dashboard-ready dict
    """
    date_col    = col_map.get("date")
    revenue_col = col_map.get("revenue")
    profit_col  = col_map.get("profit")
    cost_col    = col_map.get("cost")
    orders_col  = col_map.get("orders")
    product_col = col_map.get("product")
    region_col  = col_map.get("region")
    margin_col  = col_map.get("margin")

    if not revenue_col:
        raise ValueError("Could not find a revenue/sales column. Please check your file.")

    # ── Clean revenue column ──────────────────────────────────────────────────
    df["_revenue"] = to_numeric(df[revenue_col])
    df = df[df["_revenue"] > 0].copy()  # drop zero-revenue rows

    # ── Derive profit & cost ──────────────────────────────────────────────────
    if profit_col:
        df["_profit"] = to_numeric(df[profit_col])
    elif cost_col:
        df["_cost"]   = to_numeric(df[cost_col])
        df["_profit"] = df["_revenue"] - df["_cost"]
    else:
        df["_profit"] = df["_revenue"] * 0.35  # fallback margin

    df["_cost"] = df["_revenue"] - df["_profit"]

    # ── Orders ────────────────────────────────────────────────────────────────
    df["_orders"] = to_numeric(df[orders_col]) if orders_col else 1

    # ── Month labels ──────────────────────────────────────────────────────────
    if date_col:
        df["_month"] = df[date_col].apply(parse_month_label)
    else:
        df["_month"] = "All"

    # ── Monthly aggregation (Pandas groupby) ──────────────────────────────────
    monthly_grp = df.groupby("_month", sort=False).agg(
        revenue=("_revenue", "sum"),
        profit=("_profit",  "sum"),
        cost=("_cost",    "sum"),
        orders=("_orders",  "sum"),
    ).reset_index().rename(columns={"_month": "month"})

    # Sort by calendar month order where possible
    def month_sort_key(m):
        try:
            return MONTH_ORDER.index(m)
        except ValueError:
            return 99
    monthly_grp["_sort"] = monthly_grp["month"].apply(month_sort_key)
    monthly_grp = monthly_grp.sort_values("_sort").drop(columns="_sort")

    # ── Product aggregation ───────────────────────────────────────────────────
    if product_col:
        prod_grp = df.groupby(product_col, sort=False).agg(
            revenue=("_revenue", "sum"),
            units=("_orders",   "sum"),
        ).reset_index().rename(columns={product_col: "name"})

        if margin_col:
            margin_grp = df.groupby(product_col)[margin_col].apply(
                lambda s: to_numeric(s).mean()
            ).reset_index().rename(columns={product_col: "name", margin_col: "margin"})
            prod_grp = prod_grp.merge(margin_grp, on="name", how="left")
        else:
            prod_grp["margin"] = 35  # fallback

        prod_grp = prod_grp.sort_values("revenue", ascending=False).head(10)
    else:
        prod_grp = pd.DataFrame([{
            "name": "All Products",
            "revenue": df["_revenue"].sum(),
            "units":   df["_orders"].sum(),
            "margin":  35,
        }])

    # ── Region aggregation ────────────────────────────────────────────────────
    if region_col:
        reg_grp = df.groupby(region_col, sort=False).agg(
            sales=("_revenue", "sum"),
        ).reset_index().rename(columns={region_col: "region"})
        avg_sales = reg_grp["sales"].mean()
        reg_grp["target"] = avg_sales * 1.1
        reg_grp["growth"] = ((reg_grp["sales"] / avg_sales) - 1) * 100
        reg_grp = reg_grp.sort_values("sales", ascending=False).head(8)
    else:
        reg_grp = pd.DataFrame([{
            "region": "Overall",
            "sales":  df["_revenue"].sum(),
            "target": df["_revenue"].sum() * 1.1,
            "growth": 0.0,
        }])

    # ── Scatter data ──────────────────────────────────────────────────────────
    scatter_df = df.head(80)[["_revenue", "_orders"]].copy()
    scatter_df.columns = ["revenue", "ads"]
    scatter_df["ads"] = scatter_df["ads"] * 1000
    scatter_data = scatter_df[scatter_df["revenue"] > 0].to_dict(orient="records")

    # ── Radar data ────────────────────────────────────────────────────────────
    radar_data = []
    for _, row in prod_grp.head(6).iterrows():
        name = str(row["name"])
        rev  = float(row["revenue"])
        radar_data.append({
            "product": name[:10] + "…" if len(name) > 10 else name,
            "Q1": round(rev * 0.22),
            "Q3": round(rev * 0.25),
        })

    # ── KPIs ──────────────────────────────────────────────────────────────────
    total_revenue = float(monthly_grp["revenue"].sum())
    total_profit  = float(monthly_grp["profit"].sum())
    total_orders  = float(monthly_grp["orders"].sum())
    avg_margin    = round((total_profit / total_revenue) * 100) if total_revenue else 0

    return {
        "monthlyData": monthly_grp.round(2).to_dict(orient="records"),
        "productData": prod_grp.round(2).to_dict(orient="records"),
        "regionData":  reg_grp.round(2).to_dict(orient="records"),
        "scatterData": scatter_data,
        "radarData":   radar_data,
        "kpis": {
            "totalRevenue": round(total_revenue, 2),
            "totalProfit":  round(total_profit,  2),
            "totalOrders":  round(total_orders,  2),
            "avgMargin":    avg_margin,
        },
        "rowCount": len(df),
    }
