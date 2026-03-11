import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.js';

const FIELDS = [
  { key:'date',    label:'Date / Month',      hint:'Column with dates or month names' },
  { key:'revenue', label:'Revenue / Sales ★', hint:'Primary monetary value (required)' },
  { key:'profit',  label:'Profit / Net',       hint:'Leave blank to auto-calculate' },
  { key:'cost',    label:'Cost / Expense',     hint:'Leave blank if not available' },
  { key:'orders',  label:'Orders / Units',     hint:'Quantity or transaction count' },
  { key:'product', label:'Product / Category', hint:'Item or category name' },
  { key:'region',  label:'Region / Location',  hint:'Geographic grouping' },
  { key:'margin',  label:'Margin %',           hint:'Percentage margin column (optional)' },
];

export default function ColumnMapper({ headers, detected, sampleRows, onConfirm, onCancel }) {
  const C = useTheme();
  const [mapping, setMapping] = useState(() => {
    const m = {};
    FIELDS.forEach(f => { m[f.key] = detected[f.key] || ''; });
    return m;
  });

  return (
    <div className="col-mapper" style={{ background:C.card, borderColor:C.border }}>
      <div className="col-mapper-title" style={{ color:C.text }}>Map Your Columns</div>
      <div className="col-mapper-hint" style={{ color:C.muted }}>
        Columns auto-detected by the Python backend. Adjust if needed, then click <strong>Process with Python</strong>.
      </div>

      <div className="col-mapper-grid">
        {FIELDS.map(f => (
          <div key={f.key}>
            <div className="col-mapper-field-label" style={{ color:C.sub }}>{f.label}</div>
            <select value={mapping[f.key]}
              onChange={e => setMapping(m => ({ ...m, [f.key]: e.target.value }))}
              className="col-mapper-select"
              style={{ background:C.bg, borderColor:C.border, color:C.text }}>
              <option value="">— not mapped —</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <div className="col-mapper-field-hint" style={{ color:C.faint }}>{f.hint}</div>
          </div>
        ))}
      </div>

      {/* Sample data preview */}
      {sampleRows?.length > 0 && (
        <div style={{ marginBottom:16, overflowX:'auto' }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.sub, marginBottom:6 }}>
            Preview (first 3 rows)
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} style={{ padding:'4px 8px', background:C.bg, color:C.muted, borderBottom:`1px solid ${C.border}`, textAlign:'left', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, i) => (
                <tr key={i}>
                  {headers.map(h => (
                    <td key={h} style={{ padding:'4px 8px', color:C.sub, borderBottom:`1px solid ${C.divider}`, whiteSpace:'nowrap' }}>
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="col-mapper-actions">
        <button className="btn-primary" style={{ background:C.accent }} onClick={() => onConfirm(mapping)}>
          🐍 Process with Python
        </button>
        <button className="btn-secondary" style={{ borderColor:C.border, color:C.muted }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
