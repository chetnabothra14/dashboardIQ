const BASE = 'http://localhost:8000/api';

/**
 * Upload a file to the FastAPI backend.
 * Returns full dashboard JSON including charts, forecast, anomalies.
 */
export async function uploadFile(file, colMapOverride = null) {
  const form = new FormData();
  form.append('file', file);
  if (colMapOverride) {
    form.append('col_map_override', JSON.stringify(colMapOverride));
  }

  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}

/**
 * Get just headers + detected columns from a file (lightweight pre-scan).
 */
export async function getFileColumns(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/upload/columns`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Could not read file columns');
  return res.json();
}

/**
 * Re-run scikit-learn forecast on already-processed data.
 */
export async function runForecast(monthlyData, periods = 3) {
  const res = await fetch(`${BASE}/forecast`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ monthlyData, periods }),
  });
  if (!res.ok) throw new Error('Forecast failed');
  return res.json();
}

/**
 * Regenerate Matplotlib/Seaborn charts from processed data.
 */
export async function regenerateCharts(monthlyData, productData, forecastData, chartType = 'all') {
  const res = await fetch(`${BASE}/charts/regenerate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ monthlyData, productData, forecastData, chartType }),
  });
  if (!res.ok) throw new Error('Chart generation failed');
  return res.json();
}
