import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, MapPin, Sprout, Cloud, Store, Sparkles } from "lucide-react";

const demoProfiles = [
  { name: "💰 High Income — Sugarcane, Maharashtra", land_size: "15", irrigated_percentage: 95, soil_type: "Black Cotton", crop_type: "Sugarcane", season: "Kharif", yield_per_acre: "38", rainfall: "800", temperature: "30", market_price: "3500", market_distance: "5" },
  { name: "📉 Low Income — Small Rainfed Plot, Bihar", land_size: "1.5", irrigated_percentage: 10, soil_type: "Sandy", crop_type: "Pulses", season: "Rabi", yield_per_acre: "6", rainfall: "400", temperature: "25", market_price: "4200", market_distance: "35" },
  { name: "🌊 Edge — Flood-Prone Rice, Tamil Nadu", land_size: "5", irrigated_percentage: 70, soil_type: "Alluvial", crop_type: "Rice", season: "Kharif", yield_per_acre: "20", rainfall: "1400", temperature: "29", market_price: "2100", market_distance: "12" },
  { name: "🏔️ Edge — High Yield but Remote, Himachal", land_size: "8", irrigated_percentage: 50, soil_type: "Loamy", crop_type: "Vegetables", season: "Zaid", yield_per_acre: "30", rainfall: "650", temperature: "18", market_price: "6000", market_distance: "55" },
];

const soilTypes = ["Loamy", "Clay", "Sandy", "Black Cotton", "Red", "Alluvial", "Laterite"];
const cropTypes = ["Rice", "Wheat", "Sugarcane", "Cotton", "Maize", "Soybean", "Pulses", "Groundnut", "Vegetables"];
const seasons = ["Kharif", "Rabi", "Zaid"];

const card = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(134,179,80,0.12)",
  borderRadius: 16,
  padding: "24px",
  marginBottom: 24,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 14,
  color: "#fff",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block", letterSpacing: "0.3px" };
const errorStyle = { fontSize: 11, color: "#ef4444", marginTop: 4 };

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      {children}
      {error && <span style={errorStyle}>{error.message}</span>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid rgba(134,179,80,0.1)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(134,179,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color="#86B350" />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{title}</span>
    </div>
  );
}

export default function PredictionForm({ onSubmit, isLoading }) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [loadedProfile, setLoadedProfile] = useState(null);
  const [locationStr, setLocationStr] = useState("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { land_size: "", irrigated_percentage: 50, soil_type: "", crop_type: "", season: "", yield_per_acre: "", rainfall: "", temperature: "", market_price: "", market_distance: "" },
  });

  const irrigated = watch("irrigated_percentage");

  const fetchWeather = async () => {
    if (!locationStr.trim()) { setWeatherError("Please enter a location"); return; }
    setIsFetchingWeather(true); setWeatherError("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationStr)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) { setWeatherError("Location not found"); return; }
      const { latitude, longitude } = geoData.results[0];
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const wData = await wRes.json();
      if (wData.current_weather?.temperature !== undefined) {
        setValue("temperature", wData.current_weather.temperature, { shouldValidate: true });
      } else setWeatherError("Weather data unavailable");
    } catch { setWeatherError("Failed to fetch weather"); }
    finally { setIsFetchingWeather(false); }
  };

  const fillDemo = () => {
    const profile = demoProfiles[demoIndex];
    const { name, ...values } = profile;
    reset(values); setLoadedProfile(name);
    setDemoIndex((prev) => (prev + 1) % demoProfiles.length);
  };

  return (
    <section id="prediction" style={{ background: "linear-gradient(180deg, #0f170c 0%, #111a0d 100%)", padding: "80px 0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(134,179,80,0.1)", border: "1px solid rgba(134,179,80,0.2)", padding: "5px 14px", borderRadius: 100, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#86B350", letterSpacing: "0.5px" }}>INCOME PREDICTION</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>
            Farmer Financial Intelligence
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto 24px" }}>
            Enter farmer details below to generate an AI-powered annual income prediction
          </p>
          <button
            type="button" onClick={fillDemo}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(134,179,80,0.1)", border: "1px solid rgba(134,179,80,0.25)", color: "#86B350", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(134,179,80,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(134,179,80,0.1)"}
          >
            <Sparkles size={15} /> Try Demo — {demoProfiles[demoIndex].name}
          </button>
          {loadedProfile && (
            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(134,179,80,0.08)", border: "1px solid rgba(134,179,80,0.15)", padding: "6px 14px", borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: "#86B350" }}>✦ {loadedProfile}</span>
              <button onClick={() => setLoadedProfile(null)} style={{ fontSize: 11, color: "rgba(134,179,80,0.6)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear</button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Section 1 */}
          <div style={card}>
            <SectionHeader icon={MapPin} title="Farmer & Land Details" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="form-grid-3">
              <Field label="Land Size (acres)" error={errors.land_size}>
                <input type="number" step="0.1" placeholder="e.g. 5.5" style={inputStyle}
                  {...register("land_size", { required: "Required", min: { value: 0.1, message: "Min 0.1" } })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
              <Field label={`Irrigated Land (${irrigated}%)`}>
                <div style={{ paddingTop: 8 }}>
                  <input type="range" min="0" max="100" style={{ width: "100%", accentColor: "#86B350" }} {...register("irrigated_percentage")} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>0%</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>100%</span>
                  </div>
                </div>
              </Field>
              <Field label="Soil Type" error={errors.soil_type}>
                <select style={{ ...inputStyle, cursor: "pointer" }} {...register("soil_type", { required: "Select soil type" })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}>
                  <option value="" style={{ background: "#1a2a0f" }}>Select...</option>
                  {soilTypes.map((s) => <option key={s} value={s} style={{ background: "#1a2a0f" }}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Section 2 */}
          <div style={card}>
            <SectionHeader icon={Sprout} title="Crop Details" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="form-grid-3">
              <Field label="Crop Type" error={errors.crop_type}>
                <select style={{ ...inputStyle, cursor: "pointer" }} {...register("crop_type", { required: "Select crop" })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}>
                  <option value="" style={{ background: "#1a2a0f" }}>Select...</option>
                  {cropTypes.map((c) => <option key={c} value={c} style={{ background: "#1a2a0f" }}>{c}</option>)}
                </select>
              </Field>
              <Field label="Season" error={errors.season}>
                <select style={{ ...inputStyle, cursor: "pointer" }} {...register("season", { required: "Select season" })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}>
                  <option value="" style={{ background: "#1a2a0f" }}>Select...</option>
                  {seasons.map((s) => <option key={s} value={s} style={{ background: "#1a2a0f" }}>{s}</option>)}
                </select>
              </Field>
              <Field label="Yield per Acre (quintals)" error={errors.yield_per_acre}>
                <input type="number" step="0.1" placeholder="e.g. 18" style={inputStyle}
                  {...register("yield_per_acre", { required: "Required", min: { value: 0.1, message: "Min 0.1" } })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
            </div>
          </div>

          {/* Section 3 */}
          <div style={card}>
            <SectionHeader icon={Cloud} title="Environmental Conditions" />
            <div style={{ background: "rgba(134,179,80,0.04)", border: "1px solid rgba(134,179,80,0.1)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <label style={labelStyle}>AUTO-FETCH LIVE TEMPERATURE</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" placeholder="e.g. Pune, Maharashtra" value={locationStr} onChange={e => setLocationStr(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button type="button" onClick={fetchWeather} disabled={isFetchingWeather}
                  style={{ padding: "11px 16px", background: "rgba(134,179,80,0.12)", border: "1px solid rgba(134,179,80,0.25)", color: "#86B350", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {isFetchingWeather ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <MapPin size={14} />}
                  Fetch Temp
                </button>
              </div>
              {weatherError && <p style={errorStyle}>{weatherError}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid-2">
              <Field label="Rainfall (mm)" error={errors.rainfall}>
                <input type="number" placeholder="e.g. 850" style={inputStyle}
                  {...register("rainfall", { required: "Required", min: { value: 0, message: "Min 0" } })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
              <Field label="Temperature (°C)" error={errors.temperature}>
                <input type="number" step="0.1" placeholder="e.g. 28.5" style={inputStyle}
                  {...register("temperature", { required: "Required" })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
            </div>
          </div>

          {/* Section 4 */}
          <div style={card}>
            <SectionHeader icon={Store} title="Market Details" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid-2">
              <Field label="Price per Quintal (₹)" error={errors.market_price}>
                <input type="number" placeholder="e.g. 2200" style={inputStyle}
                  {...register("market_price", { required: "Required", min: { value: 1, message: "Min 1" } })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
              <Field label="Distance to Market (km)" error={errors.market_distance}>
                <input type="number" step="0.1" placeholder="e.g. 12" style={inputStyle}
                  {...register("market_distance", { required: "Required", min: { value: 0, message: "Min 0" } })}
                  onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </Field>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            style={{ width: "100%", padding: "16px", background: isLoading ? "rgba(134,179,80,0.4)" : "#86B350", color: "#0f170c", fontWeight: 700, fontSize: 15, borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 32px rgba(134,179,80,0.25)" }}>
            {isLoading ? (<><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Predicting...</>) : "Predict Annual Income →"}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .form-grid-3 { grid-template-columns: 1fr !important; } .form-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
