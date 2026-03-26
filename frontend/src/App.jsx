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
import { ArrowLeftRight, BarChart3 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("predict"); // "predict" | "compare"
  const [result, setResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const switchMode = (newMode) => {
    setMode(newMode);
    setResult(null);
    setCompareResult(null);
    setError(null);
  };

  const handlePredict = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setFormData(data);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await axios.post(`${API_URL}/api/predict`, data);
      setResult(res.data);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Prediction failed. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (data) => {
    setIsLoading(true);
    setCompareResult(null);
    setError(null);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await axios.post(`${API_URL}/api/compare`, data);
      setCompareResult(res.data);
    } catch (err) {
      console.error("Compare failed:", err);
      setError("Comparison failed. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <StatsTicker />
      <HeroSection />

      {/* Mode Toggle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => switchMode("predict")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "predict"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Predict
            </button>
            <button
              onClick={() => switchMode("compare")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === "compare"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Compare
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Predict Mode */}
        {mode === "predict" && (
          <>
            <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
            <div
              ref={resultRef}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8"
            >
              {isLoading && <ResultSkeleton />}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm animate-fade-in-up">
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

        {/* Compare Mode */}
        {mode === "compare" && (
          <>
            <CompareForm onSubmit={handleCompare} isLoading={isLoading} />
            <div
              ref={resultRef}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8"
            >
              {isLoading && <CompareSkeleton />}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm animate-fade-in-up">
                  ⚠️ {error}
                </div>
              )}
              {!isLoading && compareResult && (
                <CompareResult result={compareResult} />
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
