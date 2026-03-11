import { useTheme } from '../../context/ThemeContext.js';
import { ServerChart } from '../ui/SharedUI.jsx';

export default function PythonChartsTab({ serverCharts, isUploaded }) {
  const C = useTheme();

  if (!isUploaded || !serverCharts) {
    return (
      <div style={{
        textAlign:'center', padding:'60px 20px',
        background:C.card, borderRadius:12, border:`1px solid ${C.border}`
      }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🐍</div>
        <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:8 }}>
          Python Charts
        </div>
        <div style={{ fontSize:13, color:C.muted, maxWidth:400, margin:'0 auto' }}>
          Upload a CSV or Excel file to generate server-side charts using
          Matplotlib and Seaborn via the FastAPI backend.
        </div>
        <div style={{ marginTop:20, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
          {['Revenue Distribution (Seaborn)','Correlation Heatmap (Seaborn)','Product Bar Chart (Matplotlib)','Monthly Trend (Matplotlib)','Margin Boxplot (Seaborn)'].map(t => (
            <span key={t} style={{
              fontSize:11, padding:'4px 12px', borderRadius:20,
              background:C.accentBg, border:`1px solid ${C.accentBdr}`, color:C.accent
            }}>{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="two-col-grid">
      {serverCharts.revenueDistribution && (
        <ServerChart
          src={serverCharts.revenueDistribution}
          title="Revenue Distribution"
          subtitle="Seaborn KDE histogram — spread of monthly revenue values"
        />
      )}
      {serverCharts.correlationHeatmap && (
        <ServerChart
          src={serverCharts.correlationHeatmap}
          title="Metric Correlation Matrix"
          subtitle="Seaborn heatmap — how revenue, profit, cost & orders correlate"
        />
      )}
      {serverCharts.monthlyTrend && (
        <ServerChart
          src={serverCharts.monthlyTrend}
          title="Monthly Trend + Forecast"
          subtitle="Matplotlib line chart — historical data + sklearn forecast overlay"
          span={2}
        />
      )}
      {serverCharts.productBar && (
        <ServerChart
          src={serverCharts.productBar}
          title="Top Products — Python Bar Chart"
          subtitle="Matplotlib horizontal bar with INR value labels"
        />
      )}
      {serverCharts.marginBoxplot && (
        <ServerChart
          src={serverCharts.marginBoxplot}
          title="Margin % Distribution"
          subtitle="Seaborn box plot — spread and outliers in product margins"
        />
      )}

      {/* Python stack badge */}
      <div style={{
        gridColumn:'span 2', background:C.accentBg, border:`1px solid ${C.accentBdr}`,
        borderRadius:10, padding:'14px 20px', display:'flex', alignItems:'center', gap:14
      }}>
        <span style={{ fontSize:28 }}>🐍</span>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:3 }}>
            All charts on this tab are generated server-side by Python
          </div>
          <div style={{ fontSize:11, color:C.muted }}>
            FastAPI backend · Pandas data processing · Matplotlib visualisation · Seaborn statistical charts · scikit-learn forecasting
          </div>
        </div>
      </div>
    </div>
  );
}
