import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, MapPin, Sprout, Cloud, Store, ArrowLeftRight, Sparkles, Flame, Snowflake } from "lucide-react";

const soilTypes = ["Loamy", "Clay", "Sandy", "Black Cotton", "Red", "Alluvial", "Laterite"];
const cropTypes = ["Rice", "Wheat", "Sugarcane", "Cotton", "Maize", "Soybean", "Pulses", "Groundnut", "Vegetables"];
const seasons = ["Kharif", "Rabi", "Zaid"];

const presets = {
  a: { name: "💰 High Income — Sugarcane, Maharashtra", land_size: "15", irrigated_percentage: 95, soil_type: "Black Cotton", crop_type: "Sugarcane", season: "Kharif", yield_per_acre: "38", rainfall: "800", temperature: "30", market_price: "3500", market_distance: "5" },
  b: { name: "📉 Low Income — Small Rainfed Plot, Bihar", land_size: "1.5", irrigated_percentage: 10, soil_type: "Sandy", crop_type: "Pulses", season: "Rabi", yield_per_acre: "6", rainfall: "400", temperature: "25", market_price: "4200", market_distance: "35" },
};

const inputStyle = {
  width: "100%", padding: "9px 12px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, fontSize: 13, color: "#fff", outline: "none",
  boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
};
const labelStyle = { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 5, display: "block", letterSpacing: "0.3px" };

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      {children}
      {error && <span style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{error.message}</span>}
    </div>
  );
}

function ScenarioPanel({ id, label, icon: Icon, accent, register, errors, setValue, irrigated, onFillPreset, presetName }) {
  const prefix = id;
  const [locationStr, setLocationStr] = useState("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const fetchWeather = async () => {
    if (!locationStr.trim()) { setWeatherError("Enter a location"); return; }
    setIsFetchingWeather(true); setWeatherError("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationStr)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) { setWeatherError("Not found"); return; }
      const { latitude, longitude } = geoData.results[0];
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const wData = await wRes.json();
      if (wData.current_weather?.temperature !== undefined) setValue(`${prefix}_temperature`, wData.current_weather.temperature, { shouldValidate: true });
      else setWeatherError("Data unavailable");
    } catch { setWeatherError("Failed to fetch"); }
    finally { setIsFetchingWeather(false); }
  };

  const isAmber = accent === "amber";
  const accentColor = isAmber ? "#fbbf24" : "#38bdf8";
  const accentBg = isAmber ? "rgba(251,191,36,0.08)" : "rgba(56,189,248,0.08)";
  const accentBorder = isAmber ? "rgba(251,191,36,0.15)" : "rgba(56,189,248,0.15)";

  return (
    <div style={{ flex: 1, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 16, padding: "20px 20px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `rgba(${isAmber ? "251,191,36" : "56,189,248"},0.12)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={14} color={accentColor} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{label}</span>
        </div>
        <button type="button" onClick={onFillPreset}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: accentColor, background: `rgba(${isAmber ? "251,191,36" : "56,189,248"},0.1)`, border: `1px solid ${accentBorder}`, padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>
          <Sparkles size={10} /> Demo
        </button>
      </div>

      {presetName && (
        <div style={{ marginBottom: 14, fontSize: 10, fontWeight: 600, color: accentColor, background: `rgba(${isAmber ? "251,191,36" : "56,189,248"},0.08)`, border: `1px solid ${accentBorder}`, padding: "5px 10px", borderRadius: 6 }}>
          ✦ {presetName}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <MapPin size={10} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>LAND & FARMER</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Field label="Land (acres)" error={errors?.[`${prefix}_land_size`]}>
          <input type="number" step="0.1" placeholder="5.5" style={inputStyle} {...register(`${prefix}_land_size`, { required: "Required", min: { value: 0.1, message: "Min 0.1" } })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
        <Field label={`Irrigated (${irrigated}%)`}>
          <div style={{ paddingTop: 4 }}>
            <input type="range" min="0" max="100" style={{ width: "100%", accentColor }} {...register(`${prefix}_irrigated_percentage`)} />
          </div>
        </Field>
        <Field label="Soil" error={errors?.[`${prefix}_soil_type`]}>
          <select style={{ ...inputStyle, cursor: "pointer" }} {...register(`${prefix}_soil_type`, { required: "Required" })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}>
            <option value="" style={{ background: "#162110" }}>Select...</option>
            {soilTypes.map((s) => <option key={s} value={s} style={{ background: "#162110" }}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Sprout size={10} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>CROP</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Field label="Crop" error={errors?.[`${prefix}_crop_type`]}>
          <select style={{ ...inputStyle, cursor: "pointer" }} {...register(`${prefix}_crop_type`, { required: "Required" })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}>
            <option value="" style={{ background: "#162110" }}>Select...</option>
            {cropTypes.map((c) => <option key={c} value={c} style={{ background: "#162110" }}>{c}</option>)}
          </select>
        </Field>
        <Field label="Season" error={errors?.[`${prefix}_season`]}>
          <select style={{ ...inputStyle, cursor: "pointer" }} {...register(`${prefix}_season`, { required: "Required" })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}>
            <option value="" style={{ background: "#162110" }}>Select...</option>
            {seasons.map((s) => <option key={s} value={s} style={{ background: "#162110" }}>{s}</option>)}
          </select>
        </Field>
        <Field label="Yield/Acre (q)" error={errors?.[`${prefix}_yield_per_acre`]}>
          <input type="number" step="0.1" placeholder="18" style={inputStyle} {...register(`${prefix}_yield_per_acre`, { required: "Required", min: { value: 0.1, message: "Min 0.1" } })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Cloud size={10} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>ENVIRONMENT</span>
      </div>
      <div style={{ marginBottom: 12, padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="City/District" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          <button type="button" onClick={fetchWeather} disabled={isFetchingWeather}
            style={{ padding: "9px 12px", background: `rgba(${isAmber ? "251,191,36" : "56,189,248"},0.1)`, border: `1px solid ${accentBorder}`, color: accentColor, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}>
            {isFetchingWeather ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <MapPin size={12} />}
          </button>
        </div>
        {weatherError && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 4 }}>{weatherError}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Field label="Rainfall (mm)" error={errors?.[`${prefix}_rainfall`]}>
          <input type="number" placeholder="850" style={inputStyle} {...register(`${prefix}_rainfall`, { required: "Required", min: { value: 0, message: "Min 0" } })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
        <Field label="Temp (°C)" error={errors?.[`${prefix}_temperature`]}>
          <input type="number" step="0.1" placeholder="28" style={inputStyle} {...register(`${prefix}_temperature`, { required: "Required" })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Store size={10} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>MARKET</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Price/Quintal (₹)" error={errors?.[`${prefix}_market_price`]}>
          <input type="number" placeholder="2200" style={inputStyle} {...register(`${prefix}_market_price`, { required: "Required", min: { value: 1, message: "Min 1" } })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
        <Field label="Distance (km)" error={errors?.[`${prefix}_market_distance`]}>
          <input type="number" step="0.1" placeholder="12" style={inputStyle} {...register(`${prefix}_market_distance`, { required: "Required", min: { value: 0, message: "Min 0" } })} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
        </Field>
      </div>
    </div>
  );
}

export default function CompareForm({ onSubmit, isLoading }) {
  const [presetA, setPresetA] = useState(null);
  const [presetB, setPresetB] = useState(null);

  const { register, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      a_land_size: "", a_irrigated_percentage: 50, a_soil_type: "", a_crop_type: "", a_season: "", a_yield_per_acre: "", a_rainfall: "", a_temperature: "", a_market_price: "", a_market_distance: "",
      b_land_size: "", b_irrigated_percentage: 50, b_soil_type: "", b_crop_type: "", b_season: "", b_yield_per_acre: "", b_rainfall: "", b_temperature: "", b_market_price: "", b_market_distance: "",
    },
  });

  const irrigA = watch("a_irrigated_percentage");
  const irrigB = watch("b_irrigated_percentage");

  const fillPreset = (side) => {
    const p = presets[side];
    const { name, ...vals } = p;
    Object.entries(vals).forEach(([k, v]) => setValue(`${side}_${k}`, v));
    if (side === "a") setPresetA(name); else setPresetB(name);
  };

  const swapScenarios = () => {
    const vals = getValues();
    const fields = ["land_size", "irrigated_percentage", "soil_type", "crop_type", "season", "yield_per_acre", "rainfall", "temperature", "market_price", "market_distance"];
    const newVals = {};
    fields.forEach((f) => { newVals[`a_${f}`] = vals[`b_${f}`]; newVals[`b_${f}`] = vals[`a_${f}`]; });
    reset({ ...vals, ...newVals }); setPresetA(presetB); setPresetB(presetA);
  };

  const handleFormSubmit = (data) => {
    const extractScenario = (prefix) => ({
      land_size: parseFloat(data[`${prefix}_land_size`]), irrigated_percentage: parseFloat(data[`${prefix}_irrigated_percentage`]),
      soil_type: data[`${prefix}_soil_type`], crop_type: data[`${prefix}_crop_type`], season: data[`${prefix}_season`],
      yield_per_acre: parseFloat(data[`${prefix}_yield_per_acre`]), rainfall: parseFloat(data[`${prefix}_rainfall`]),
      temperature: parseFloat(data[`${prefix}_temperature`]), market_price: parseFloat(data[`${prefix}_market_price`]),
      market_distance: parseFloat(data[`${prefix}_market_distance`]),
    });
    onSubmit({ scenario_a: extractScenario("a"), scenario_b: extractScenario("b") });
  };

  return (
    <section id="compare" style={{ background: "linear-gradient(180deg, #0f170c 0%, #111a0d 100%)", padding: "80px 0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(134,179,80,0.1)", border: "1px solid rgba(134,179,80,0.2)", padding: "5px 14px", borderRadius: 100, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#86B350", letterSpacing: "0.5px" }}>SCENARIO COMPARISON</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>Compare Farming Scenarios</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 440, margin: "0 auto" }}>Evaluate two farming setups side by side to find the better investment</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }} className="compare-grid">
            <ScenarioPanel id="a" label="Scenario A" icon={Flame} accent="amber" register={register} errors={errors} setValue={setValue} irrigated={irrigA} onFillPreset={() => fillPreset("a")} presetName={presetA} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
              <button type="button" onClick={swapScenarios}
                style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(134,179,80,0.4)"; e.currentTarget.style.color = "#86B350"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                <ArrowLeftRight size={16} />
              </button>
            </div>

            <ScenarioPanel id="b" label="Scenario B" icon={Snowflake} accent="sky" register={register} errors={errors} setValue={setValue} irrigated={irrigB} onFillPreset={() => fillPreset("b")} presetName={presetB} />
          </div>

          <button type="submit" disabled={isLoading}
            style={{ marginTop: 24, width: "100%", padding: "16px", background: isLoading ? "rgba(134,179,80,0.4)" : "#86B350", color: "#0f170c", fontWeight: 700, fontSize: 15, borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 32px rgba(134,179,80,0.2)" }}>
            {isLoading ? (<><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Comparing...</>) : (<><ArrowLeftRight size={18} /> Compare Scenarios</>)}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .compare-grid { flex-direction: column !important; } }
      `}</style>
    </section>
  );
}
