import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext.js';
import { Section, CustomTooltip } from '../ui/SharedUI.jsx';
import HeatmapChart from '../charts/Heatmap.jsx';
import { fmtINRAxis } from '../../utils/formatters.js';

export default function HeatmapTab({ data }) {
  const C = useTheme();

  const peakStats = [
    { label:'Busiest Day',    value:'Wednesday',         icon:'📅' },
    { label:'Peak Hour',      value:'6:00 PM – 8:00 PM', icon:'⏰' },
    { label:'Slowest Period', value:'Sun 3:00 AM',       icon:'🌙' },
  ];

  return (
    <div className="two-col-grid">
      <Section title="Activity Heatmap" subtitle="Transaction density by day & hour" span={2}>
        <HeatmapChart data={data.heatData} />
        <div className="stats-mini-grid">
          {peakStats.map(s => (
            <div key={s.label} className="stats-mini-card" style={{ background:C.bg, borderColor:C.border }}>
              <span className="stats-mini-icon">{s.icon}</span>
              <div className="stats-mini-value" style={{ color:C.text }}>{s.value}</div>
              <div className="stats-mini-label" style={{ color:C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Regional Growth %" subtitle="Year-on-year growth rate">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data.regionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="region" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="growth" radius={[0,5,5,0]} name="Growth %">
              {data.regionData.map((e, i) => (
                <Cell key={i} fill={e.growth > 15 ? C.green : e.growth > 5 ? C.accent : C.amber} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Orders vs Revenue" subtitle="Correlation scatter">
        <ResponsiveContainer width="100%" height={230}>
          <ScatterChart margin={{ top:5, right:10, bottom:10, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="ads"     tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={fmtINRAxis} name="Orders" />
            <YAxis dataKey="revenue" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={fmtINRAxis} name="Revenue" />
            <Tooltip cursor={{ strokeDasharray:'3 3' }} content={<CustomTooltip />} />
            <Scatter data={data.scatterData} fill={C.accent} opacity={0.5} />
          </ScatterChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}
