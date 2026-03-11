"""
Server-side chart generation using Matplotlib & Seaborn.
Returns base64-encoded PNG images that the frontend can display directly.
"""

import io
import base64
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — required for servers
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict


# ── Shared style ───────────────────────────────────────────────────────────────
PALETTE    = ["#2563eb","#16a34a","#7c3aed","#b45309","#0891b2","#be185d"]
DARK_BG    = "#0f1117"
CARD_BG    = "#181c27"
TEXT_COLOR = "#f1f5f9"
GRID_COLOR = "#252d3d"


def _fig_to_base64(fig) -> str:
    """Convert a matplotlib figure to a base64 PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=130)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return f"data:image/png;base64,{encoded}"


def _dark_style(ax, fig):
    """Apply dark theme styling to axes."""
    fig.patch.set_facecolor(CARD_BG)
    ax.set_facecolor(CARD_BG)
    ax.tick_params(colors=TEXT_COLOR, labelsize=9)
    ax.xaxis.label.set_color(TEXT_COLOR)
    ax.yaxis.label.set_color(TEXT_COLOR)
    ax.title.set_color(TEXT_COLOR)
    for spine in ax.spines.values():
        spine.set_edgecolor(GRID_COLOR)
    ax.grid(color=GRID_COLOR, linestyle="--", linewidth=0.5, alpha=0.7)


# ── 1. Revenue Distribution (Seaborn histogram) ────────────────────────────────
def revenue_distribution_chart(monthly_data: List[Dict]) -> str:
    """Seaborn KDE + histogram of monthly revenue distribution."""
    revenues = [r["revenue"] for r in monthly_data]
    fig, ax  = plt.subplots(figsize=(7, 3.5))

    sns.histplot(revenues, kde=True, ax=ax, color=PALETTE[0],
                 edgecolor=CARD_BG, linewidth=0.5, alpha=0.75)
    sns.kdeplot(revenues, ax=ax, color=PALETTE[1], linewidth=2)

    ax.set_title("Revenue Distribution", fontsize=12, fontweight="bold", pad=10)
    ax.set_xlabel("Revenue (₹)")
    ax.set_ylabel("Frequency")
    _dark_style(ax, fig)
    return _fig_to_base64(fig)


# ── 2. Correlation Heatmap (Seaborn heatmap) ──────────────────────────────────
def correlation_heatmap(monthly_data: List[Dict]) -> str:
    """Seaborn correlation heatmap of revenue, profit, cost, orders."""
    df  = pd.DataFrame(monthly_data)[["revenue","profit","cost","orders"]]
    corr = df.corr()

    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        corr, annot=True, fmt=".2f", ax=ax,
        cmap="Blues", linewidths=0.5, linecolor=CARD_BG,
        annot_kws={"size": 10, "color": "white"},
        cbar_kws={"shrink": 0.8},
    )
    ax.set_title("Metric Correlation Matrix", fontsize=12, fontweight="bold", pad=10)
    ax.tick_params(colors=TEXT_COLOR, labelsize=9)
    fig.patch.set_facecolor(CARD_BG)
    ax.set_facecolor(CARD_BG)
    return _fig_to_base64(fig)


# ── 3. Product Revenue Bar Chart (Matplotlib) ─────────────────────────────────
def product_bar_chart(product_data: List[Dict]) -> str:
    """Horizontal bar chart of top products by revenue."""
    df = pd.DataFrame(product_data).head(8)

    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.barh(df["name"], df["revenue"], color=PALETTE[:len(df)], edgecolor=CARD_BG)

    # Value labels
    for bar, val in zip(bars, df["revenue"]):
        label = f"₹{val/1e5:.1f}L" if val >= 1e5 else f"₹{val/1e3:.0f}K"
        ax.text(bar.get_width() * 1.01, bar.get_y() + bar.get_height()/2,
                label, va="center", color=TEXT_COLOR, fontsize=8)

    ax.set_title("Top Products by Revenue", fontsize=12, fontweight="bold", pad=10)
    ax.set_xlabel("Revenue (₹)")
    ax.invert_yaxis()
    _dark_style(ax, fig)
    return _fig_to_base64(fig)


# ── 4. Monthly Trend Line (Matplotlib) ────────────────────────────────────────
def monthly_trend_chart(monthly_data: List[Dict], forecast_data: List[Dict] = None) -> str:
    """Line chart with historical revenue/profit + forecast overlay."""
    df = pd.DataFrame(monthly_data)

    fig, ax = plt.subplots(figsize=(9, 4))
    ax.plot(df["month"], df["revenue"], marker="o", color=PALETTE[0],
            linewidth=2, markersize=4, label="Revenue")
    ax.plot(df["month"], df["profit"],  marker="s", color=PALETTE[1],
            linewidth=2, markersize=4, label="Profit")

    # Overlay forecast if provided
    if forecast_data:
        fc = pd.DataFrame(forecast_data)
        fc_only = fc[fc["forecast"] == True]
        if not fc_only.empty:
            # Connect last historical to first forecast
            last_hist = df.iloc[-1]
            bridge_months  = [last_hist["month"]] + fc_only["month"].tolist()
            bridge_profits = [last_hist["profit"]] + fc_only["profit"].tolist()
            ax.plot(bridge_months, bridge_profits, linestyle="--",
                    color=PALETTE[2], linewidth=1.5, marker="^",
                    markersize=5, label="Forecast")

    ax.set_title("Monthly Revenue & Profit Trend", fontsize=12, fontweight="bold", pad=10)
    ax.set_xlabel("Month")
    ax.set_ylabel("Amount (₹)")
    ax.legend(facecolor=CARD_BG, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR, fontsize=9)
    plt.xticks(rotation=45)
    _dark_style(ax, fig)
    fig.tight_layout()
    return _fig_to_base64(fig)


# ── 5. Margin Box Plot (Seaborn) ───────────────────────────────────────────────
def margin_boxplot(product_data: List[Dict]) -> str:
    """Seaborn box plot of margin distribution across products."""
    df = pd.DataFrame(product_data)
    if "margin" not in df.columns or df.empty:
        return ""

    fig, ax = plt.subplots(figsize=(5, 3.5))
    sns.boxplot(x=df["margin"], ax=ax, color=PALETTE[0],
                flierprops={"markerfacecolor": PALETTE[1], "markersize": 5})
    ax.set_title("Margin % Distribution", fontsize=12, fontweight="bold", pad=10)
    ax.set_xlabel("Margin %")
    _dark_style(ax, fig)
    return _fig_to_base64(fig)
