import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext.js';
import { Section, CustomTooltip } from '../ui/SharedUI.jsx';
import { fmtINRAxis } from '../../utils/formatters.js';

export default function OverviewTab({ data, isUploaded, dark }) {
  const C = useTheme();
  return (
    <div className="two-col-grid">
      <Section title="Monthly Revenue vs Profit" subtitle={isUploaded ? 'From your data (₹)' : 'Sample data (₹)'} span={2}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.monthlyData} margin={{ top:5, right:10, bottom:0, left:10 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.accent} stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.14} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={fmtINRAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke={C.accent} fill="url(#gRev)" strokeWidth={2} name="Revenue (₹)" />
            <Area type="monotone" dataKey="profit"  stroke={C.green}  fill="url(#gPro)" strokeWidth={2} name="Profit (₹)" />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Sales by Region" subtitle="Actual vs Target (₹)">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data.regionData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="region" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={fmtINRAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales"  fill={C.accent}                    radius={[4,4,0,0]} name="Actual (₹)" />
            <Bar dataKey="target" fill={dark ? '#1e3a8a' : '#93c5fd'} radius={[4,4,0,0]} name="Target (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Order Volume" subtitle="Monthly transaction count">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="orders" stroke={C.amber} strokeWidth={2} dot={{ fill:C.amber, r:3 }} activeDot={{ r:5 }} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}
