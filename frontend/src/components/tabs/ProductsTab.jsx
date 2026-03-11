import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext.js';
import { Section, CustomTooltip } from '../ui/SharedUI.jsx';
import { fmtINRAxis } from '../../utils/formatters.js';

export default function ProductsTab({ data }) {
  const C = useTheme();

  return (
    <div className="two-col-grid">
      <Section title="Top Products by Revenue" subtitle="Annual sales in ₹" span={2}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.productData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={fmtINRAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[5,5,0,0]} name="Revenue (₹)">
              {data.productData.map((_, i) => <Cell key={i} fill={C.chart[i % C.chart.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Product Margin %" subtitle="Profit margin per category">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data.productData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="margin" radius={[0,5,5,0]} name="Margin %">
              {data.productData.map((e, i) => (
                <Cell key={i} fill={e.margin > 40 ? C.green : e.margin > 30 ? C.accent : C.amber} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Quarterly Radar" subtitle="Q1 vs Q3 across products">
        <ResponsiveContainer width="100%" height={230}>
          <RadarChart data={data.radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="product" tick={{ fill:C.muted, fontSize:10 }} />
            <Radar name="Q1" dataKey="Q1" stroke={C.accent} fill={C.accent} fillOpacity={0.08} strokeWidth={1.5} />
            <Radar name="Q3" dataKey="Q3" stroke={C.green}  fill={C.green}  fillOpacity={0.08} strokeWidth={1.5} />
            <Legend iconSize={10} wrapperStyle={{ fontSize:11, color:C.muted }} />
          </RadarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Units Sold" subtitle="Volume per product">
        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          {data.productData.map((p, i) => {
            const pct = (p.units / Math.max(...data.productData.map(d => d.units), 1)) * 100;
            return (
              <div key={i} className="units-row">
                <div className="units-name" style={{ color:C.sub }}>{p.name}</div>
                <div className="units-track" style={{ background:C.bg, borderColor:C.border }}>
                  <div className="units-fill" style={{ width:`${pct}%`, background:C.chart[i % C.chart.length] }} />
                </div>
                <div className="units-count" style={{ color:C.muted }}>{p.units.toLocaleString('en-IN')}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
