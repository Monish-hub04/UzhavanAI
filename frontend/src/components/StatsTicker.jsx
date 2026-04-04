import { TrendingUp, Users, Clock, Cpu, Leaf, ShieldCheck } from "lucide-react";

const items = [
  { icon: TrendingUp, label: "Model Accuracy", value: "98.4%" },
  { icon: Users, label: "Farmers Supported", value: "12,540+" },
  { icon: Clock, label: "Avg Prediction Time", value: "0.8s" },
  { icon: Cpu, label: "Features Analyzed", value: "286" },
  { icon: Leaf, label: "Crops Covered", value: "50+" },
  { icon: ShieldCheck, label: "Loan Predictions", value: "8,920+" },
];

export default function StatsTicker() {
  return (
    <div style={{
      background: "rgba(134,179,80,0.08)",
      borderBottom: "1px solid rgba(134,179,80,0.12)",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", animation: "ticker 28s linear infinite", whiteSpace: "nowrap", padding: "10px 0" }}>
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 48 }}>
            <item.icon size={14} color="#86B350" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{item.label}:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#86B350" }}>{item.value}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
