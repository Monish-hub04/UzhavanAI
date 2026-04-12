import { IndianRupee, ShieldCheck, ShieldAlert, ShieldX, TrendingUp } from "lucide-react";

const eligibilityConfig = {
  High: { bg: "rgba(134,179,80,0.12)", border: "rgba(134,179,80,0.3)", color: "#86B350", icon: ShieldCheck, label: "High Eligibility" },
  Medium: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24", icon: ShieldAlert, label: "Medium Eligibility" },
  Low: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#ef4444", icon: ShieldX, label: "Low Eligibility" },
};

export default function ResultCard({ result }) {
  if (!result) return null;

  const income = result.predicted_income;
  const eligibility = result.loan_eligibility || "Medium";
  const config = eligibilityConfig[eligibility];
  const Icon = config.icon;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(income);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(134,179,80,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      border: "1px solid rgba(134,179,80,0.2)",
      borderRadius: 20, padding: "40px 32px",
      textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Background glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(134,179,80,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 12 }}>PREDICTED ANNUAL INCOME</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 24 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 800, color: "#86B350", lineHeight: 1 }}>
            {formatted.replace("₹", "")}
          </span>
        </div>
        <div style={{ fontSize: 28, color: "#86B350", marginTop: -16, marginBottom: 24 }}>₹</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: config.bg, border: `1px solid ${config.border}`, padding: "10px 20px", borderRadius: 10 }}>
            <Icon size={16} color={config.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: config.color }}>{config.label}</span>
          </div>
          {result.model_version && (
            <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 6 }}>Engine:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{result.model_version}</span>
            </div>
          )}
          {result.features_used && (
            <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 6 }}>Features:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{result.features_used}</span>
            </div>
          )}
        </div>

        {/* Income benchmark context */}
        <div style={{ marginTop: 24, padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.4px" }}>TRAINING DATA BENCHMARKS</div>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Bottom 25%", value: "< ₹7.2L", active: income < 720000 },
              { label: "Median", value: "₹9.5L", active: income >= 720000 && income < 1300000 },
              { label: "Top 25%", value: "> ₹13L", active: income >= 1300000 },
            ].map(({ label, value, active }) => (
              <div key={label} style={{ textAlign: "center", padding: "6px 14px", borderRadius: 8, background: active ? "rgba(134,179,80,0.1)" : "transparent", border: active ? "1px solid rgba(134,179,80,0.25)" : "1px solid transparent" }}>
                <div style={{ fontSize: 11, color: active ? "#86B350" : "rgba(255,255,255,0.3)", fontWeight: active ? 700 : 400 }}>{label}</div>
                <div style={{ fontSize: 13, color: active ? "#86B350" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.1)", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
      <div style={{ width: 180, height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 6, margin: "0 auto 20px" }} />
      <div style={{ width: 280, height: 64, background: "rgba(255,255,255,0.06)", borderRadius: 10, margin: "0 auto 24px" }} />
      <div style={{ width: 160, height: 40, background: "rgba(255,255,255,0.06)", borderRadius: 10, margin: "0 auto" }} />
    </div>
  );
}
