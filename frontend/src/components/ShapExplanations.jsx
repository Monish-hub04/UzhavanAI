import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Lightbulb } from "lucide-react";

export default function ShapExplanations({ show, result }) {
  if (!show || !result || !result.shap_values) return null;

  const { positive, negative } = result.shap_values;
  const chartData = [
    ...positive.map((item) => ({ ...item, type: "positive" })),
    ...negative.map((item) => ({ ...item, type: "negative" })),
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(134,179,80,0.12)",
      borderRadius: 16, padding: 24,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(134,179,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Lightbulb size={18} color="#86B350" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>Why was this income predicted?</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>AI explanation of the key factors driving the model's estimate</p>
        </div>
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="feature" width={160} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(134,179,80,0.05)" }}
              contentStyle={{ background: "#162110", border: "1px solid rgba(134,179,80,0.2)", borderRadius: 10, fontSize: 12, color: "#fff", boxShadow: "none" }}
              formatter={(value) => [`${value > 0 ? "+" : ""}₹${value.toLocaleString()}`, "Impact"]}
              labelStyle={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.type === "positive" ? "#86B350" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#86B350", display: "inline-block" }} />
          Increases Estimate
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          Decreases Estimate
        </div>
      </div>
    </div>
  );
}
