import { Trophy, TrendingUp, TrendingDown, ArrowRight, IndianRupee, Gauge, Equal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from "recharts";

const fmt = (val) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

function AgriScoreGauge({ score, label, color }) {
  const data = [{ name: label, value: score, fill: color }];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <RadialBarChart width={120} height={120} cx={60} cy={60} innerRadius={40} outerRadius={54} barSize={11} data={data} startAngle={210} endAngle={-30}>
          <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={6} max={100} />
        </RadialBarChart>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{score}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/ 100</span>
        </div>
      </div>
      <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{label}</p>
    </div>
  );
}

function MetricCard({ label, valueA, valueB, format = "number" }) {
  const fmtVal = (v) => format === "currency" ? fmt(v) : format === "score" ? v.toFixed(1) : v;
  const better = valueA > valueB ? "A" : valueB > valueA ? "B" : null;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.1)", borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 14, letterSpacing: "0.5px" }}>{label.toUpperCase()}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: better === "A" ? "#86B350" : "rgba(255,255,255,0.6)", fontFamily: "'Playfair Display', serif" }}>{fmtVal(valueA)}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Scenario A</p>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "0 12px" }}>vs</span>
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: better === "B" ? "#86B350" : "rgba(255,255,255,0.6)", fontFamily: "'Playfair Display', serif" }}>{fmtVal(valueB)}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Scenario B</p>
        </div>
      </div>
    </div>
  );
}

export default function CompareResult({ result }) {
  if (!result) return null;
  const { scenario_a, scenario_b, comparison } = result;
  const better = comparison.better_scenario;
  const isTie = better === "Tie";
  const winnerColor = better === "A" ? "#fbbf24" : "#38bdf8";

  const incomeChartData = [
    { name: "Scenario A", value: scenario_a.predicted_income, fill: "#fbbf24" },
    { name: "Scenario B", value: scenario_b.predicted_income, fill: "#38bdf8" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@800&display=swap" rel="stylesheet" />

      {/* Winner Banner */}
      <div style={{
        background: isTie ? "rgba(255,255,255,0.04)" : `rgba(${better === "A" ? "251,191,36" : "56,189,248"},0.08)`,
        border: `1px solid ${isTie ? "rgba(255,255,255,0.1)" : `rgba(${better === "A" ? "251,191,36" : "56,189,248"},0.2)`}`,
        borderRadius: 16, padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          {isTie ? <Equal size={22} color="rgba(255,255,255,0.6)" /> : <Trophy size={22} color={winnerColor} />}
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            {isTie ? "It's a Tie!" : `Scenario ${better} Wins!`}
          </h3>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 20px" }}>{comparison.recommendation}</p>

        {!isTie && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {comparison.income_difference_pct > 0 ? <TrendingUp size={16} color={winnerColor} /> : <TrendingDown size={16} color="#ef4444" />}
              <span style={{ fontWeight: 800, fontSize: 20, color: winnerColor, fontFamily: "'Playfair Display', serif" }}>{comparison.income_difference_pct}%</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>higher income</span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <span style={{ fontWeight: 700, color: "#fff" }}>{fmt(comparison.income_difference)}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>difference</span>
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="compare-charts">
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.12)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Gauge size={14} color="#86B350" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.3px" }}>AGRISCORE COMPARISON</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            <AgriScoreGauge score={scenario_a.agri_score} label="Scenario A" color="#fbbf24" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <ArrowRight size={16} color="rgba(255,255,255,0.2)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>Δ {comparison.agri_score_difference}</span>
            </div>
            <AgriScoreGauge score={scenario_b.agri_score} label="Scenario B" color="#38bdf8" />
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.12)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <IndianRupee size={14} color="#86B350" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.3px" }}>INCOME COMPARISON</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={incomeChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: "rgba(255,255,255,0.5)" }} width={85} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#162110", border: "1px solid rgba(134,179,80,0.2)", borderRadius: 10, fontSize: 12, color: "#fff" }} formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, "Income"]} cursor={{ fill: "rgba(134,179,80,0.04)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                {incomeChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="metrics-grid">
        <MetricCard label="Predicted Income" valueA={scenario_a.predicted_income} valueB={scenario_b.predicted_income} format="currency" />
        <MetricCard label="AgriScore" valueA={scenario_a.agri_score} valueB={scenario_b.agri_score} format="score" />
        <MetricCard label="Loan Eligibility" valueA={scenario_a.loan_eligibility === "High" ? 3 : scenario_a.loan_eligibility === "Medium" ? 2 : 1} valueB={scenario_b.loan_eligibility === "High" ? 3 : scenario_b.loan_eligibility === "Medium" ? 2 : 1} format="text" />
      </div>
      <style>{`
        @media (max-width: 768px) { .compare-charts { grid-template-columns: 1fr !important; } .metrics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[140, 280, 100].map((h, i) => (
        <div key={i} style={{ height: h, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.08)", borderRadius: 16, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
