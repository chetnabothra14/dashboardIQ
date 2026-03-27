import { useState, useCallback } from 'react';
import { ThemeContext, LIGHT, DARK } from './context/ThemeContext.js';
import { KPICard, ThemeToggle } from './components/ui/SharedUI.jsx';
import ColumnMapper    from './components/ui/ColumnMapper.jsx';
import OverviewTab     from './components/tabs/OverviewTab.jsx';
import HeatmapTab      from './components/tabs/HeatmapTab.jsx';
import ProductsTab     from './components/tabs/ProductsTab.jsx';
import ForecastTab     from './components/tabs/ForecastTab.jsx';
import PythonChartsTab from './components/tabs/PythonChartsTab.jsx';
import { useFileUpload } from './hooks/useFileUpload.js';
import { generateSampleData } from './data/sampleData.js';
import { fmtINR } from './utils/formatters.js';
import './styles/global.css';

const TABS = ['overview','heatmap','products','forecast','python charts'];

export default function App() {
  const [dark,         setDark]        = useState(false);
  const [activeTab,    setActiveTab]   = useState('overview');
  const [sampleData]   = useState(() => generateSampleData());
  const [backendData,  setBackendData] = useState(null);

  const C          = dark ? DARK : LIGHT;
  const isUploaded = !!backendData;

  // Build dashboard data shape from either backend or sample
  const data = backendData ? {
    monthlyData:  backendData.monthlyData  || [],
    productData:  backendData.productData  || [],
    regionData:   backendData.regionData   || [],
    scatterData:  backendData.scatterData  || [],
    radarData:    backendData.radarData    || [],
    forecastData: backendData.forecastData || [],
    heatData:     sampleData.heatData,         // heatmap still uses sample
    anomalies:    backendData.anomalies    || [],
    totalRevenue: backendData.kpis?.totalRevenue || 0,
    totalProfit:  backendData.kpis?.totalProfit  || 0,
    totalOrders:  backendData.kpis?.totalOrders  || 0,
    avgMargin:    backendData.kpis?.avgMargin    || 0,
  } : sampleData;

  const upload = useFileUpload(useCallback(d => setBackendData(d), []));


  return (
    <ThemeContext.Provider value={C}>
      <div className="app" style={{ background:C.bg, color:C.text }}>

        {/* ── Header ── */}
        <header className="header" style={{ background:C.card, borderBottomColor:C.border }}>
          <div className="header-brand">
            <div className="header-logo" style={{ background:C.accentBg }}>📊</div>
            <div>
              <div className="header-title" style={{ color:C.text }}>SalesIQ</div>
              <div className="header-subtitle" style={{ color:C.muted }}>
                {isUploaded
                  ? `📁 ${upload.fileName} · Processed by Python`
                  : 'React + FastAPI · Pandas · scikit-learn · Matplotlib'}
              </div>
            </div>
          </div>
          <div className="header-right">
            {TABS.map(t => (
              <button key={t} className="tab-btn" onClick={() => setActiveTab(t)}
                style={{
                  borderColor: activeTab===t ? C.accent : C.border,
                  background:  activeTab===t ? C.accentBg : 'transparent',
                  color:       activeTab===t ? C.accent : C.muted,
                }}>
                {t === 'python charts' ? '🐍 Python Charts' : t}
              </button>
            ))}
            <div className="header-divider" style={{ background:C.border }}/>
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)}/>
          </div>
        </header>

        <main className="page-content">

          {/* ── Upload Zone ── */}
          {upload.fileState === 'idle' && (
            <div className={`upload-zone${upload.dragging?' dragging':''}`}
              onDragOver={e => { e.preventDefault(); upload.setDragging(true); }}
              onDragLeave={() => upload.setDragging(false)}
              onDrop={upload.onDrop}
              style={{ borderColor:upload.dragging?C.accent:C.border, background:upload.dragging?C.accentBg:C.card }}>
              <div className="upload-icon">📂</div>
              <div className="upload-title" style={{ color:C.text }}>Upload CSV or Excel file</div>
              <div className="upload-hint"  style={{ color:C.muted }}>
                Drag & drop or click to browse · Processed by FastAPI + Pandas backend
              </div>
              <div className="upload-columns-hint" style={{ color:C.faint }}>
                Supports: .csv · .xlsx · .xls · .pdf
              </div>
              {/* Python stack badges */}
              <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', margin:'10px 0 14px' }}>
                {['🐍 FastAPI','🐼 Pandas','📊 Matplotlib','📈 Seaborn','🤖 scikit-learn'].map(b => (
                  <span key={b} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:C.accentBg, border:`1px solid ${C.accentBdr}`, color:C.accent }}>{b}</span>
                ))}
              </div>
              {upload.parseError && (
                <div className="upload-error" style={{ background:dark?'#2a1010':'#fef2f2', borderColor:`${C.red}40`, color:C.red }}>
                  {upload.parseError}
                </div>
              )}
              <label className="upload-btn-label" style={{ background:C.accent }}>
                Browse File
                <input type="file" accept=".csv,.xlsx,.xls,.pdf" style={{ display:'none' }}
                  onChange={e => upload.handleFile(e.target.files[0])}/>
              </label>
            </div>
          )}

          {/* ── Scanning spinner ── */}
          {upload.fileState === 'scanning' && (
            <div style={{ textAlign:'center', padding:'40px', background:C.card, borderRadius:12, border:`1px solid ${C.border}`, marginBottom:20 }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🐍</div>
              <div style={{ fontSize:14, color:C.text, fontWeight:600 }}>Reading file with Pandas…</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>Detecting columns from {upload.fileName}</div>
            </div>
          )}

          {/* ── Column Mapper ── */}
          {upload.fileState === 'mapping' && (
            <ColumnMapper
              headers={upload.fileHeaders}
              detected={upload.detectedCols}
              sampleRows={upload.sampleRows}
              onConfirm={upload.applyMapping}
              onCancel={upload.clearFile}
            />
          )}

          {/* ── Uploading progress ── */}
          {upload.fileState === 'uploading' && (
            <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:'28px 24px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⚙️</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>
                Processing with Python…
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
                Pandas aggregation · scikit-learn forecast · Matplotlib chart generation
              </div>
              <div style={{ background:C.bg, borderRadius:100, height:8, overflow:'hidden', border:`1px solid ${C.border}`, maxWidth:400, margin:'0 auto' }}>
                <div style={{ width:`${upload.uploadPct}%`, height:'100%', background:C.accent, borderRadius:100, transition:'width 0.3s ease' }}/>
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>{upload.uploadPct}%</div>
            </div>
          )}

          {/* ── File loaded banner ── */}
          {upload.fileState === 'ready' && (
            <div className="file-banner" style={{ background:C.greenBg, borderColor:C.greenBdr }}>
              <span style={{ fontSize:16 }}>✅</span>
              <div>
                <span style={{ color:C.green, fontWeight:600 }}>Python processed: </span>
                <span style={{ color:C.sub }}>{upload.fileName}</span>
                <span style={{ color:C.muted }}>
                  {' · '}{backendData?.rowCount?.toLocaleString('en-IN')} rows
                  {backendData?.forecastR2 && ` · Forecast R² ${backendData.forecastR2}%`}
                </span>
              </div>
              <button className="file-banner-clear" style={{ color:C.muted, borderColor:C.border }} onClick={upload.clearFile}>
                ✕ Clear
              </button>
            </div>
          )}

          {/* ── KPIs ── */}
          <div className="kpi-grid">
            <KPICard label="Total Revenue"   value={fmtINR(data.totalRevenue)} sub={isUploaded?'Pandas aggregation':'Sample data'}         color={C.accent} bg={C.accentBg} icon="₹"/>
            <KPICard label="Net Profit"      value={fmtINR(data.totalProfit)}  sub={`${data.avgMargin}% avg margin`}                       color={C.green}  bg={C.greenBg} icon="📈"/>
            <KPICard label="Total Orders"    value={(data.totalOrders||0).toLocaleString('en-IN')} sub={isUploaded?`${backendData?.rowCount} rows`:'Sample data'} color={C.purple} bg={dark?'#2e1f5e':'#f5f3ff'} icon="🛒"/>
            <KPICard label="Avg Order Value" value={fmtINR(Math.round((data.totalRevenue||0)/(data.totalOrders||1)))} sub="Per transaction" color={C.amber}  bg={C.amberBg} icon="🎯"/>
          </div>

          {/* ── Tab Panels ── */}
          {activeTab==='overview'       && <OverviewTab   data={data} isUploaded={isUploaded} dark={dark}/>}
          {activeTab==='heatmap'        && <HeatmapTab    data={data}/>}
          {activeTab==='products'       && <ProductsTab   data={data}/>}
          {activeTab==='forecast'       && <ForecastTab   data={data} isUploaded={isUploaded} serverCharts={backendData?.charts} forecastR2={backendData?.forecastR2} growthSummary={backendData?.growthSummary}/>}
          {activeTab==='python charts'  && <PythonChartsTab serverCharts={backendData?.charts} isUploaded={isUploaded}/>}

        </main>

        <footer className="footer" style={{ borderTopColor:C.border, color:C.faint }}>
          SalesIQ &nbsp;·&nbsp;
          {isUploaded
            ? `${upload.fileName} · ${backendData?.rowCount} rows · Python backend`
            : 'Upload CSV or Excel · FastAPI + Pandas + scikit-learn + Matplotlib'}
          &nbsp;·&nbsp; ₹ INR
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}
