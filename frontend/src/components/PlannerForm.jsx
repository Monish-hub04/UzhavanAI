import { useState } from "react";
import { Loader2, MapPin, Calendar, Sprout, BrainCircuit, Sparkles, Thermometer, CloudRain, CheckCircle } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cropTypes = ["Rice", "Wheat", "Sugarcane", "Cotton", "Maize", "Soybean", "Pulses", "Groundnut", "Vegetables"];

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 14,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "flex", alignItems: "center", gap: 7,
  fontSize: 12, fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 8, letterSpacing: "0.4px",
};

// =============================================
// WEATHER FETCH FUNCTIONS
// =============================================

async function getCoordinates(location) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results?.length) throw new Error("Location not found");
  return {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
  };
}

// Get historical climate average for that month
// Uses last year's same month as a reliable proxy for far-future dates
async function fetchClimateAverage(lat, lon, month) {
  // Use last year's data for the same month as seasonal average
  const lastYear = new Date().getFullYear() - 1;
  const pad = (n) => String(n).padStart(2, "0");
  const startDate = `${lastYear}-${pad(month)}-01`;
  // End on last day of that month
  const lastDay = new Date(lastYear, month, 0).getDate();
  const endDate = `${lastYear}-${pad(month)}-${pad(lastDay)}`;

  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&timezone=Asia%2FKolkata`
  );
  const data = await res.json();

  if (!data.daily) throw new Error("Climate data unavailable");

  // Average across the whole month
  const avgMax = data.daily.temperature_2m_max.reduce((a, b) => a + b, 0) / data.daily.temperature_2m_max.length;
  const avgMin = data.daily.temperature_2m_min.reduce((a, b) => a + b, 0) / data.daily.temperature_2m_min.length;
  const totalRain = data.daily.precipitation_sum.reduce((a, b) => a + b, 0);

  return {
    temperature: parseFloat(((avgMax + avgMin) / 2).toFixed(1)),
    rainfall: parseFloat(totalRain.toFixed(1)),
    isClimateAvg: true,
  };
}

async function fetchWeatherForDate(lat, lon, date) {
  const today = new Date().toISOString().split("T")[0];
  const forecastLimit = new Date();
  forecastLimit.setDate(forecastLimit.getDate() + 15);
  const forecastLimitStr = forecastLimit.toISOString().split("T")[0];

  const targetDate = new Date(date);
  const month = targetDate.getMonth() + 1; // 1-12

  // Case 1: Past date → use archive API
  if (date < today) {
    const res = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&start_date=${date}&end_date=${date}` +
      `&timezone=Asia%2FKolkata`
    );
    const data = await res.json();
    if (!data.daily) throw new Error("Archive data unavailable");

    const tempMax = data.daily.temperature_2m_max?.[0] ?? 30;
    const tempMin = data.daily.temperature_2m_min?.[0] ?? 22;
    const rainfall = data.daily.precipitation_sum?.[0] ?? 0;

    return {
      temperature: parseFloat(((tempMax + tempMin) / 2).toFixed(1)),
      rainfall: parseFloat((rainfall ?? 0).toFixed(1)),
      isClimateAvg: false,
    };
  }

  // Case 2: Within 15 days → use forecast API
  if (date <= forecastLimitStr) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&start_date=${date}&end_date=${date}` +
      `&timezone=Asia%2FKolkata`
    );
    const data = await res.json();
    if (!data.daily) throw new Error("Forecast data unavailable");

    const tempMax = data.daily.temperature_2m_max?.[0] ?? 30;
    const tempMin = data.daily.temperature_2m_min?.[0] ?? 22;
    const rainfall = data.daily.precipitation_sum?.[0] ?? 0;

    return {
      temperature: parseFloat(((tempMax + tempMin) / 2).toFixed(1)),
      rainfall: parseFloat((rainfall ?? 0).toFixed(1)),
      isClimateAvg: false,
    };
  }

  // Case 3: Far future (beyond 15 days) → use last year's monthly average
  return await fetchClimateAverage(lat, lon, month);
}

export default function PlannerForm() {
  const [formData, setFormData] = useState({ location: "", date: "", crop_type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [temperature, setTemperature] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFetched, setWeatherFetched] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  // Track if climate average was used instead of exact forecast
  const [isClimateAvg, setIsClimateAvg] = useState(false);

  const autoFillWeather = async (location, date) => {
    if (!location || !date) return;

    setWeatherLoading(true);
    setWeatherFetched(false);
    setWeatherError(null);
    setIsClimateAvg(false);

    try {
      const { lat, lon } = await getCoordinates(location);
      const weather = await fetchWeatherForDate(lat, lon, date);

      setTemperature(String(weather.temperature));
      setRainfall(String(weather.rainfall));
      setWeatherFetched(true);
      setIsClimateAvg(weather.isClimateAvg);
    } catch (err) {
      console.warn("Weather fetch failed:", err.message);
      setWeatherError("Could not fetch weather. You can enter manually.");
      setTemperature("28.0");
      setRainfall("0.0");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationBlur = () => {
    if (formData.location && formData.date) {
      autoFillWeather(formData.location, formData.date);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFormData({ ...formData, date: newDate });
    if (formData.location && newDate) {
      autoFillWeather(formData.location, newDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.date || !formData.crop_type) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const finalTemp = parseFloat(temperature) || 25.0;
      const finalRain = parseFloat(rainfall) || 0.0;

      const res = await axios.post(`${API_URL}/api/plan`, {
        ...formData,
        temperature: finalTemp,
        rainfall: finalRain,
      });

      if (res.data.error) throw new Error(res.data.error);
      setResult(res.data.insights);
    } catch (err) {
      setError(err.message || "Failed to generate AI insights.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = (text) => {
    if (!text) return null;
    const sections = text.split(/\n(?=\d\.|##|\*\*\d)/);
    if (sections.length <= 1) {
      return (
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {text}
        </p>
      );
    }
    return sections.map((section, i) => (
      <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < sections.length - 1 ? "1px solid rgba(134,179,80,0.08)" : "none" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {section.trim()}
        </p>
      </div>
    ));
  };

  return (
    <section style={{ background: "linear-gradient(180deg, #0f170c 0%, #111a0d 100%)", padding: "80px 0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "5px 14px", borderRadius: 100, marginBottom: 16 }}>
            <BrainCircuit size={12} color="#818cf8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: "0.5px" }}>AI AGRONOMIST</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>
            AI Crop Planner
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 440, margin: "0 auto" }}>
            Enter your location and crop preferences — our AI agronomist will give you expert guidance
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.12)", borderRadius: 20, padding: 32, marginBottom: 24 }}>

          {/* Row 1: Location, Date, Crop */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }} className="planner-grid">
            <div>
              <label style={labelStyle}>
                <MapPin size={12} color="#86B350" /> LOCATION
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chennai, Tamil Nadu"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onBlur={handleLocationBlur}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <Calendar size={12} color="#86B350" /> PLANTING DATE
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={handleDateChange}
                style={{ ...inputStyle, colorScheme: "dark" }}
                onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <Sprout size={12} color="#86B350" /> TARGET CROP
              </label>
              <select
                required
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              >
                <option value="" style={{ background: "#1a2a0f" }}>Select Crop...</option>
                {cropTypes.map((c) => (
                  <option key={c} value={c} style={{ background: "#1a2a0f" }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Temperature + Rainfall */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }} className="planner-grid">
            <div>
              <label style={labelStyle}>
                <Thermometer size={12} color="#86B350" /> TEMPERATURE (°C)
                {weatherLoading && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Fetching...
                  </span>
                )}
                {weatherFetched && !weatherLoading && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#86B350", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={10} /> {isClimateAvg ? "Seasonal avg" : "Auto-filled"}
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={weatherLoading ? "Fetching..." : "e.g. 28.5"}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: weatherFetched ? "rgba(134,179,80,0.4)" : "rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                onBlur={e => e.target.style.borderColor = weatherFetched ? "rgba(134,179,80,0.4)" : "rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <CloudRain size={12} color="#86B350" /> RAINFALL (mm)
                {weatherLoading && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Fetching...
                  </span>
                )}
                {weatherFetched && !weatherLoading && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#86B350", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={10} /> {isClimateAvg ? "Seasonal avg" : "Auto-filled"}
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={weatherLoading ? "Fetching..." : "e.g. 850"}
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: weatherFetched ? "rgba(134,179,80,0.4)" : "rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(134,179,80,0.5)"}
                onBlur={e => e.target.style.borderColor = weatherFetched ? "rgba(134,179,80,0.4)" : "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>

          {/* Status notes */}
          {weatherError && (
            <div style={{ marginBottom: 20, padding: "10px 14px", background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: 8, fontSize: 12, color: "rgba(255,200,80,0.8)" }}>
              ⚠️ {weatherError}
            </div>
          )}
          {isClimateAvg && weatherFetched && !weatherLoading && (
            <div style={{ marginBottom: 20, padding: "10px 14px", background: "rgba(134,179,80,0.04)", border: "1px solid rgba(134,179,80,0.1)", borderRadius: 8, fontSize: 12, color: "rgba(134,179,80,0.7)" }}>
              📅 Date is beyond forecast range — showing seasonal climate average for that month. You can still edit manually.
            </div>
          )}
          {!weatherFetched && !weatherLoading && !weatherError && (
            <div style={{ marginBottom: 20, padding: "10px 14px", background: "rgba(134,179,80,0.04)", border: "1px solid rgba(134,179,80,0.1)", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              🌤️ Temperature and rainfall will be auto-filled when you enter location and date
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", padding: "16px", background: isLoading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #4a7c20, #86B350)", color: "#0f170c", fontWeight: 700, fontSize: 15, borderRadius: 12, border: "none", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 32px rgba(134,179,80,0.2)" }}
          >
            {isLoading
              ? (<><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Consulting AI Agronomist...</>)
              : (<><BrainCircuit size={18} /> Get AI Agronomy Insights</>)
            }
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", color: "#ef4444", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,179,80,0.15)", borderRadius: 20, padding: 32, animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(134,179,80,0.1)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(134,179,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="#86B350" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 2 }}>AI Agronomy Report</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  {formData.crop_type} · {formData.location} · {formData.date}
                  {weatherFetched && (
                    <span style={{ color: "#86B350", marginLeft: 8 }}>
                      · {temperature}°C · {rainfall}mm {isClimateAvg ? "(seasonal avg)" : ""}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div>{renderResult(result)}</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .planner-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}