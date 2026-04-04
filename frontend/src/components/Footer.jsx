export default function Footer() {
  return (
    <footer id="about" style={{ background: "#080e07", borderTop: "1px solid rgba(134,179,80,0.1)", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #86B350, #4a7c20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌾</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
                Uzhavan<span style={{ color: "#86B350" }}> AI</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
              AI-powered financial intelligence for India's agricultural heartland. Empowering lenders and farmers with data-driven income predictions.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["React", "LightGBM", "Python", "Groq AI"].map((t) => (
                <span key={t} style={{ padding: "4px 10px", background: "rgba(134,179,80,0.08)", border: "1px solid rgba(134,179,80,0.12)", borderRadius: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", marginBottom: 20 }}>NAVIGATION</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Home", "#dashboard"], ["Predict Income", "#prediction"], ["Insights", "#insights"], ["About", "#about"]].map(([label, href]) => (
                <li key={href}>
                  <a href={href} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#86B350"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.8px", marginBottom: 20 }}>TECH STACK</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["React + Vite", "Tailwind CSS", "LightGBM (5-Fold)", "FastAPI", "Recharts", "Groq LLaMA"].map((t) => (
                <li key={t} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Uzhavan AI — AI for Agricultural Finance</span>
          <span style={{ fontSize: 12, color: "rgba(134,179,80,0.4)" }}>Built for Financial Inclusion 🌾</span>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@800&display=swap');
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
