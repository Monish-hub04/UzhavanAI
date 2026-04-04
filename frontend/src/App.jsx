import { useState, useRef } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsTicker from "./components/StatsTicker";
import PredictionForm from "./components/PredictionForm";
import ResultCard, { ResultSkeleton } from "./components/ResultCard";
import ChartsSection from "./components/ChartsSection";
import InsightPanel from "./components/InsightPanel";
import Footer from "./components/Footer";
import ShapExplanations from "./components/ShapExplanations";
import CompareForm from "./components/CompareForm";
import CompareResult, { CompareSkeleton } from "./components/CompareResult";
import PlannerForm from "./components/PlannerForm";
import { ArrowLeftRight, BarChart3, BrainCircuit } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("predict");
  const [result, setResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const switchMode = (newMode) => {
    setMode(newMode); setResult(null); setCompareResult(null); setError(null);
  };

  const handlePredict = async (data) => {
    setIsLoading(true); setResult(null); setError(null); setFormData(data);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await axios.post(`${API_URL}/api/predict`, data);
      setResult(res.data);
    } catch (err) {
      setError("Prediction failed. Make sure the backend server is running.");
    } finally { setIsLoading(false); }
  };

  const handleCompare = async (data) => {
    setIsLoading(true); setCompareResult(null); setError(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await axios.post(`${API_URL}/api/compare`, data);
      setCompareResult(res.data);
    } catch (err) {
      setError("Comparison failed. Make sure the backend server is running.");
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f170c", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f170c; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
      `}</style>

      <Navbar />
      <StatsTicker />
      <HeroSection />

      {/* Mode Toggle */}
      <div style={{ background: "#0f170c", padding: "48px 24px 0", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(134,179,80,0.12)", borderRadius: 14, padding: 4, gap: 4 }}>
          {[
            { id: "predict", label: "Predict", icon: BarChart3 },
            { id: "compare", label: "Compare", icon: ArrowLeftRight },
            { id: "plan", label: "AI Planner", icon: BrainCircuit },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchMode(id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                background: mode === id ? "rgba(134,179,80,0.15)" : "transparent",
                color: mode === id ? "#86B350" : "rgba(255,255,255,0.4)",
                border: mode === id ? "1px solid rgba(134,179,80,0.25)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ flex: 1 }}>
        {mode === "predict" && (
          <>
            <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
            <div ref={resultRef} style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
              {isLoading && <ResultSkeleton />}
              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", color: "#ef4444", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  ⚠️ {error}
                </div>
              )}
              {!isLoading && result && (
                <>
                  <ResultCard result={result} />
                  <ShapExplanations show={!!result} result={result} />
                  <ChartsSection show={!!result} result={result} />
                  <InsightPanel formData={formData} show={!!result} />
                </>
              )}
            </div>
          </>
        )}

        {mode === "compare" && (
          <>
            <CompareForm onSubmit={handleCompare} isLoading={isLoading} />
            <div ref={resultRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
              {isLoading && <CompareSkeleton />}
              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", color: "#ef4444", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  ⚠️ {error}
                </div>
              )}
              {!isLoading && compareResult && <CompareResult result={compareResult} />}
            </div>
          </>
        )}

        {mode === "plan" && <PlannerForm />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
