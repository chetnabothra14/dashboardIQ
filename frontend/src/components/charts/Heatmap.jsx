import { useTheme } from '../../context/ThemeContext.js';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function Heatmap({ data }) {
  const C = useTheme();
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const getColor = t => {
    if (t < 0.15) return C.heat[0];
    if (t < 0.35) return C.heat[1];
    if (t < 0.55) return C.heat[2];
    if (t < 0.75) return C.heat[3];
    return C.heat[4];
  };

  return (
    <div className="heatmap-wrapper">
      {/* Hour labels */}
      <div className="heatmap-hour-labels">
        {HOURS.map(h => (
          <div key={h} className="heatmap-hour-label" style={{ color:C.faint }}>
            {h % 6 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>

      {/* Day rows */}
      {DAYS.map(day => (
        <div key={day} className="heatmap-row">
          <div className="heatmap-day-label" style={{ color:C.muted }}>{day}</div>
          {HOURS.map(h => {
            const cell = data.find(d => d.day === day && d.hour === h);
            const t    = (cell?.value ?? 0) / maxVal;
            return (
              <div
                key={h}
                className="heatmap-cell"
                title={`${day} ${h}:00 — ${cell?.value ?? 0} txns`}
                style={{ background:getColor(t), borderColor:C.border }}
              />
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="heatmap-legend-label" style={{ color:C.muted }}>Low</span>
        {C.heat.map(c => (
          <div key={c} className="heatmap-legend-swatch" style={{ background:c, borderColor:C.border }} />
        ))}
        <span className="heatmap-legend-label" style={{ color:C.muted }}>High</span>
      </div>
    </div>
  );
}
