import { Lightbulb, TrendingUp, AlertTriangle, Leaf } from "lucide-react";

function generateInsights(formData) {
  const insights = [];
  const irrigated = Number(formData?.irrigated_percentage || 0);
  const distance = Number(formData?.market_distance || 0);
  const yieldPerAcre = Number(formData?.yield_per_acre || 0);
  const rainfall = Number(formData?.rainfall || 0);
  const landSize = Number(formData?.land_size || 0);

  if (irrigated >= 70) {
    insights.push({ icon: TrendingUp, accent: "#86B350", bg: "rgba(134,179,80,0.08)", border: "rgba(134,179,80,0.15)", tag: "POSITIVE", title: "Strong irrigation coverage", desc: `${irrigated}% irrigated land ensures consistent crop growth and higher income potential.` });
  } else if (irrigated < 40) {
    insights.push({ icon: AlertTriangle, accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)", tag: "CAUTION", title: "Low irrigation coverage", desc: `Only ${irrigated}% irrigated. Consider drip or sprinkler systems to boost yield significantly.` });
  }
  if (distance > 20) {
    insights.push({ icon: AlertTriangle, accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)", tag: "RISK", title: "Market distance risk", desc: `At ${distance}km from the nearest mandi, transportation costs may cut into profits.` });
  } else {
    insights.push({ icon: TrendingUp, accent: "#86B350", bg: "rgba(134,179,80,0.08)", border: "rgba(134,179,80,0.15)", tag: "POSITIVE", title: "Good market accessibility", desc: `Only ${distance}km from the nearest mandi — low transport costs support better margins.` });
  }
  if (yieldPerAcre >= 15) {
    insights.push({ icon: Leaf, accent: "#86B350", bg: "rgba(134,179,80,0.08)", border: "rgba(134,179,80,0.15)", tag: "POSITIVE", title: "High crop yield potential", desc: `Yield of ${yieldPerAcre} quintals/acre indicates productive farming with excellent practices.` });
  } else {
    insights.push({ icon: Lightbulb, accent: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)", tag: "TIP", title: "Yield improvement opportunity", desc: `Current yield of ${yieldPerAcre} q/acre can be improved with better seed varieties and fertilization.` });
  }
  if (rainfall > 1000) {
    insights.push({ icon: AlertTriangle, accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.15)", tag: "RISK", title: "High rainfall risk", desc: `Rainfall of ${rainfall}mm may cause waterlogging. Ensure proper drainage systems are in place.` });
  }
  if (landSize > 5) {
    insights.push({ icon: TrendingUp, accent: "#86B350", bg: "rgba(134,179,80,0.08)", border: "rgba(134,179,80,0.15)", tag: "POSITIVE", title: "Large landholding advantage", desc: `${landSize} acres provides economies of scale for mechanized farming operations.` });
  }
  return insights.slice(0, 3);
}

export default function InsightPanel({ formData, show }) {
  if (!show) return null;
  const insights = generateInsights(formData);

  return (
    <div id="insights" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(134,179,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lightbulb size={16} color="#86B350" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Smart Insights</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="insights-grid">
        {insights.map((insight, i) => (
          <div key={i} style={{ background: insight.bg, border: `1px solid ${insight.border}`, borderRadius: 14, padding: 20, transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `rgba(${insight.accent === "#86B350" ? "134,179,80" : insight.accent === "#fbbf24" ? "251,191,36" : "99,102,241"},0.15)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <insight.icon size={16} color={insight.accent} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: insight.accent, letterSpacing: "0.8px", background: `rgba(${insight.accent === "#86B350" ? "134,179,80" : insight.accent === "#fbbf24" ? "251,191,36" : "99,102,241"},0.1)`, padding: "3px 7px", borderRadius: 5 }}>{insight.tag}</span>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{insight.title}</h4>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{insight.desc}</p>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 768px) { .insights-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
