import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "#dashboard" },
  { label: "Predict", href: "#prediction" },
  { label: "Insights", href: "#insights" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(15, 23, 12, 0.97)" : "rgba(15, 23, 12, 1)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(134, 179, 80, 0.15)" : "1px solid transparent",
        transition: "all 0.3s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #86B350, #4a7c20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            🌾
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
            Uzhavan<span style={{ color: "#86B350" }}> IQ</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-links">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.background = "rgba(134,179,80,0.12)"; }}
              onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.65)"; e.target.style.background = "transparent"; }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#prediction"
            style={{
              marginLeft: 8, padding: "8px 20px",
              fontSize: 13, fontWeight: 600,
              background: "#86B350", color: "#0f170c",
              borderRadius: 8, textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "#9ecf62"; }}
            onMouseLeave={e => { e.target.style.background = "#86B350"; }}
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 8, display: "none" }}
          className="mobile-hamburger"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "rgba(15,23,12,0.98)", borderTop: "1px solid rgba(134,179,80,0.1)", padding: "12px 24px 16px" }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 0", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-links { display: none !important; } .mobile-hamburger { display: block !important; } }
      `}</style>
    </nav>
  );
}
