import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const COLORS = ["#86B350", "#4a7c20", "#fbbf24", "#ef4444", "#6366f1"];

const sectionStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(134,179,80,0.12)",
  borderRadius: 16,
  padding: 24,
  fontFamily: "'DM Sans', sans-serif",
};

const titleStyle = { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 20, letterSpacing: "0.3px" };

export default function ChartsSection({ show, result }) {
  if (!show || !result) return null;

  const income = result.predicted_income || 0;
  const profit = Math.round(income * 0.62);
  const costs = income - profit;

  const costProfitData = [
    { name: "Net Profit", value: profit },
    { name: "Seed & Fertilizer", value: Math.round(costs * 0.4) },
    { name: "Labour", value: Math.round(costs * 0.3) },
    { name: "Machinery", value: Math.round(costs * 0.2) },
    { name: "Other Costs", value: Math.round(costs * 0.1) },
  ];

  const featureData = (result.fold_predictions || []).map((val, i) => ({
    name: `F${i + 1}`, value: val, fill: COLORS[i % COLORS.length],
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="charts-grid">
      <div style={sectionStyle}>
        <div style={titleStyle}>ESTIMATED COST VS PROFIT</div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={costProfitData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {costProfitData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#162110", border: "1px solid rgba(134,179,80,0.2)", borderRadius: 10, fontSize: 12, color: "#fff" }}
              formatter={(val) => [`₹${val.toLocaleString()}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 8 }}>
          {costProfitData.map((d, i) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i], display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={titleStyle}>MODEL STABILITY (ALL FOLDS)</span>
          <span style={{ fontSize: 10, background: "rgba(134,179,80,0.1)", color: "#86B350", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>5-Fold</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={featureData} layout="vertical" margin={{ left: 5, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)", fontWeight: 500 }} width={30} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#162110", border: "1px solid rgba(134,179,80,0.2)", borderRadius: 10, fontSize: 12, color: "#fff" }} formatter={(v) => [`₹${v.toLocaleString()}`, "Prediction"]} cursor={{ fill: "rgba(134,179,80,0.05)" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} fill="#86B350">
              <LabelList dataKey="value" position="right" formatter={(v) => `₹${(v / 1000).toFixed(0)}k`} style={{ fontSize: 10, fontWeight: 600, fill: "rgba(255,255,255,0.4)" }} offset={8} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`@media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
