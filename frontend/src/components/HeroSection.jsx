import { ArrowRight, BarChart3, Brain, Shield, TrendingUp } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="dashboard"
      style={{
        background: "linear-gradient(160deg, #0f170c 0%, #162110 50%, #1a2a0f 100%)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Background decorative circles */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(134,179,80,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(134,179,80,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Grid texture overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(134,179,80,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(134,179,80,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="hero-grid">
          {/* Left */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(134,179,80,0.12)", border: "1px solid rgba(134,179,80,0.25)",
              padding: "6px 14px", borderRadius: 100,
              marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#86B350", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#86B350", letterSpacing: "0.5px" }}>POWERED BY MACHINE LEARNING</span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(42px, 5vw, 68px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: "-1px",
            }}>
              Predict Farmer<br />
              <span style={{ color: "#86B350" }}>Income</span> with<br />
              AI Precision
            </h1>

            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
              Empowering financial institutions to assess farmer creditworthiness — driving <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>financial inclusion</strong> across India's agricultural heartland.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="#prediction"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#86B350", color: "#0f170c",
                  padding: "14px 28px", borderRadius: 12,
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  transition: "all 0.2s",
                  boxShadow: "0 8px 32px rgba(134,179,80,0.3)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#9ecf62"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#86B350"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Start Prediction <ArrowRight size={16} />
              </a>
              <a
                href="#about"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent", color: "rgba(255,255,255,0.7)",
                  padding: "14px 28px", borderRadius: 12,
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(134,179,80,0.4)"; e.currentTarget.style.color = "#86B350"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                Learn More
              </a>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { value: "98.4%", label: "Accuracy" },
                { value: "286", label: "Features" },
                { value: "12.5K+", label: "Farmers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#86B350", fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Card */}
          <div style={{ display: "flex", justifyContent: "center" }} className="hero-card-wrapper">
            <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
              {/* Main card */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(134,179,80,0.2)",
                borderRadius: 20,
                padding: 28,
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(134,179,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Brain size={20} color="#86B350" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Income Analysis</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Real-time prediction</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(134,179,80,0.12)", padding: "4px 10px", borderRadius: 100 }}>
                    <span style={{ width: 6, height: 6, background: "#86B350", borderRadius: "50%", display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: "#86B350", fontWeight: 600 }}>LIVE</span>
                  </div>
                </div>

                {/* Bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Land Size", pct: 85 },
                    { label: "Crop Yield", pct: 72 },
                    { label: "Market Price", pct: 60 },
                    { label: "Rainfall", pct: 45 },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{bar.label}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{bar.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ width: `${bar.pct}%`, height: "100%", background: `linear-gradient(90deg, #4a7c20, #86B350)`, borderRadius: 100 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Result */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>PREDICTED INCOME</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#86B350", fontFamily: "'Playfair Display', serif" }}>₹12,54,000</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(134,179,80,0.12)", border: "1px solid rgba(134,179,80,0.2)", padding: "8px 14px", borderRadius: 10 }}>
                    <Shield size={14} color="#86B350" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#86B350" }}>Eligible</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div style={{
                position: "absolute", top: -16, right: -16,
                background: "rgba(20,30,15,0.95)", border: "1px solid rgba(134,179,80,0.25)",
                borderRadius: 14, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 8,
                backdropFilter: "blur(12px)",
              }}>
                <BarChart3 size={18} color="#86B350" />
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Accuracy</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>98.4%</div>
                </div>
              </div>

              {/* Bottom badge */}
              <div style={{
                position: "absolute", bottom: -16, left: -16,
                background: "rgba(20,30,15,0.95)", border: "1px solid rgba(134,179,80,0.25)",
                borderRadius: 14, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 8,
                backdropFilter: "blur(12px)",
              }}>
                <TrendingUp size={18} color="#86B350" />
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Model</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>LightGBM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr !important; } .hero-card-wrapper { display: none !important; } }
      `}</style>
    </section>
  );
}
