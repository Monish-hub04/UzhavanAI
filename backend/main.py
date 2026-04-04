import os
import json
import numpy as np
import pandas as pd
import joblib
import shap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# =========================
# LOAD ML MODELS
# =========================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "models")
DEFAULTS_PATH = os.path.join(MODEL_DIR, "feature_defaults.json")

print("Loading models...")
models = []
for i in range(1, 6):
    path = os.path.join(MODEL_DIR, f"lgb_fold{i}.pkl")
    models.append(joblib.load(path))
    print(f"  - Fold {i} loaded")

feature_names = models[0].feature_name()

with open(DEFAULTS_PATH) as f:
    feature_defaults = json.load(f)

explainer = shap.TreeExplainer(models[0])

# =========================
# APP SETUP
# =========================
app = FastAPI(title="Uzhavan AI", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# REQUEST MODELS
# =========================
class PredictionRequest(BaseModel):
    land_size: float = 5.0
    irrigated_percentage: float = 50.0
    soil_type: str = "Loamy"
    crop_type: str = "Rice"
    season: str = "Kharif"
    yield_per_acre: float = 18.0
    rainfall: float = 800.0
    temperature: float = 28.0
    market_price: float = 2200.0
    market_distance: float = 12.0


class CompareRequest(BaseModel):
    scenario_a: PredictionRequest
    scenario_b: PredictionRequest


class PlanRequest(BaseModel):
    location: str
    date: str
    crop_type: str
    temperature: float
    rainfall: float


# =========================
# HELPER FUNCTIONS
# =========================
def build_feature_vector(req: PredictionRequest):
    row = {feat: feature_defaults.get(feat, 0.0) for feat in feature_names}

    row["Total_Land_For_Agriculture"] = req.land_size
    row["K022_Proximity_to_nearest_mandi_Km"] = req.market_distance

    for key in row:
        if "Rainfall" in key:
            row[key] = req.rainfall
        if "temperature" in key.lower():
            row[key] = req.temperature

    df = pd.DataFrame([row], columns=feature_names)
    return df.fillna(0)


def compute_agri_score(req: PredictionRequest, predicted_income: int) -> float:
    """Compute a 0-100 AgriScore based on key farming factors."""
    score = 0.0

    # Income score (max 40 pts) — normalized against 200,000 ceiling
    score += min(predicted_income / 200000, 1.0) * 40

    # Irrigation score (max 20 pts)
    score += (req.irrigated_percentage / 100) * 20

    # Rainfall score (max 15 pts) — sweet spot 600-1200mm
    if 600 <= req.rainfall <= 1200:
        score += 15
    elif 300 <= req.rainfall < 600 or 1200 < req.rainfall <= 1800:
        score += 8
    else:
        score += 3

    # Land size score (max 15 pts)
    score += min(req.land_size / 20, 1.0) * 15

    # Market proximity score (max 10 pts) — closer is better
    score += max(0, 10 - (req.market_distance / 5))

    return round(min(score, 100), 1)


def compute_loan_eligibility(predicted_income: int) -> str:
    if predicted_income >= 150000:
        return "High"
    elif predicted_income >= 75000:
        return "Medium"
    else:
        return "Low"


def predict_single(req: PredictionRequest) -> dict:
    X = build_feature_vector(req)
    preds = [model.predict(X)[0] for model in models]
    predicted_income = int(np.mean(preds))
    agri_score = compute_agri_score(req, predicted_income)
    loan_eligibility = compute_loan_eligibility(predicted_income)
    return {
        "predicted_income": predicted_income,
        "agri_score": agri_score,
        "loan_eligibility": loan_eligibility,
    }


# =========================
# ROUTES
# =========================
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/predict")
def predict(req: PredictionRequest):
    X = build_feature_vector(req)
    preds = [model.predict(X)[0] for model in models]
    avg = int(np.mean(preds))
    return {"predicted_income": avg}


# =========================
# ✅ COMPARE ROUTE (NEW)
# =========================
@app.post("/api/compare")
def compare(req: CompareRequest):
    result_a = predict_single(req.scenario_a)
    result_b = predict_single(req.scenario_b)

    income_a = result_a["predicted_income"]
    income_b = result_b["predicted_income"]

    income_diff = abs(income_a - income_b)
    income_diff_pct = round((income_diff / max(income_a, income_b)) * 100, 1) if max(income_a, income_b) > 0 else 0

    if income_a > income_b:
        better = "A"
        recommendation = f"Scenario A yields ₹{income_diff:,} more income ({income_diff_pct}% higher). Scenario A is the better farming choice."
    elif income_b > income_a:
        better = "B"
        recommendation = f"Scenario B yields ₹{income_diff:,} more income ({income_diff_pct}% higher). Scenario B is the better farming choice."
    else:
        better = "Tie"
        recommendation = "Both scenarios are projected to yield the same income."

    agri_score_diff = round(abs(result_a["agri_score"] - result_b["agri_score"]), 1)

    return {
        "scenario_a": result_a,
        "scenario_b": result_b,
        "comparison": {
            "better_scenario": better,
            "income_difference": income_diff,
            "income_difference_pct": income_diff_pct,
            "agri_score_difference": agri_score_diff,
            "recommendation": recommendation,
        },
    }


# =========================
# ✅ AI ROUTE — Groq (Free)
# =========================
@app.post("/api/plan")
def ai_planner(req: PlanRequest):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {"error": "GROQ_API_KEY not found in .env"}

    prompt = f"""
    You are an expert Indian agronomist with deep knowledge of regional farming conditions across India.

    The farmer has provided the following details:
    - Location: {req.location}
    - Planting Date: {req.date}
    - Target Crop: {req.crop_type}
    - Temperature: {req.temperature}°C
    - Rainfall: {req.rainfall} mm

    Please provide the following in a clear, structured format:

    1. VERDICT FOR TARGET CROP ({req.crop_type})
       - Is it Good / Moderate / Risky to farm {req.crop_type} at this location and time?
       - Why?

    2. BEST CROPS FOR THIS LOCATION & SEASON
       - List the top 3 most suitable crops for {req.location} during this time of year
       - For each crop mention: expected yield, water needs, and profitability
       - Clearly highlight if {req.crop_type} is among the best choices or not

    3. EXPECTED OUTCOME
       - What results can the farmer realistically expect if they go ahead with {req.crop_type}?

    4. RISKS
       - Key risks for farming {req.crop_type} at {req.location} during this period
       - Any pest, weather, or market risks to watch out for

    5. SUGGESTIONS
       - Practical tips on soil preparation, irrigation, and fertilizers
       - Whether the farmer should stick with {req.crop_type} or switch to a better alternative

    Be specific to Indian farming practices, consider the local climate of {req.location}, and use simple language a farmer can understand.
    """

    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024
        )

        return {"insights": response.choices[0].message.content}

    except Exception as e:
        return {"error": str(e)}


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)