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
    non_agri_income: float = 100000.0


class CompareRequest(BaseModel):
    scenario_a: PredictionRequest
    scenario_b: PredictionRequest


class PlanRequest(BaseModel):
    location: str
    date: str
    crop_type: str
    temperature: float = 25.0   # default if weather fetch fails
    rainfall: float = 0.0       # default if weather fetch fails


# =========================
# CROP / SOIL / SEASON MULTIPLIER TABLES
# =========================
CROP_YIELD_MULTIPLIER = {
    "Rice":       1.10,
    "Wheat":      1.00,
    "Sugarcane":  1.35,
    "Cotton":     1.20,
    "Maize":      1.05,
    "Soybean":    0.95,
    "Groundnut":  1.00,
    "Pulses":     0.85,
    "Vegetables": 1.25,
    "Fruits":     1.30,
}

SOIL_MULTIPLIER = {
    "Black":    1.15,
    "Loamy":    1.10,
    "Red":      0.95,
    "Sandy":    0.80,
    "Clay":     0.90,
    "Alluvial": 1.20,
}

SEASON_MULTIPLIER = {
    "Kharif":    1.05,
    "Rabi":      1.00,
    "Zaid":      0.90,
    "Perennial": 1.10,
}


# =========================
# HELPER FUNCTIONS
# =========================
def build_feature_vector(req: PredictionRequest):
    MEAN_SOCIO = feature_defaults.get(
        "KO22_Village_score_based_on_socio_economic_parameters_0_to_100", 37.8
    )
    MEAN_VILLAGE_POP = 42.7
    MEAN_AVG_DISB_LOG = feature_defaults.get("Avg_Disbursement_Amount_Bureau", 11.344562)

    non_agri_raw = req.non_agri_income
    land = req.land_size

    non_agri_log = np.log1p(max(non_agri_raw, 0))

    row = {feat: feature_defaults.get(feat, 0.0) for feat in feature_names}

    # --- Direct inputs ---
    row["Total_Land_For_Agriculture"] = land
    row["K022_Proximity_to_nearest_mandi_Km"] = req.market_distance
    row["Non_Agriculture_Income"] = non_agri_log

    # --- Engineered interaction features ---
    row["Land_sq"] = land ** 2
    row["NonAgriIncome_sq"] = non_agri_log ** 2
    row["Income_x_Land"] = non_agri_log * land
    row["Land_x_SocioScore"] = land * MEAN_SOCIO
    row["SocioScore_x_MandiDist"] = MEAN_SOCIO * req.market_distance
    row["Land_per_Person"] = land / (MEAN_VILLAGE_POP + 1)
    row["Land_Holding_Index_source_Total_Agri_Area_no_of_people"] = land / (MEAN_VILLAGE_POP + 1)
    row["Loan_to_Income_Ratio"] = MEAN_AVG_DISB_LOG / (non_agri_log + 1)
    row["Market_Access_Score"] = 1.0 / (1 + req.market_distance) ** 2

    for key in row:
        if "Rainfall" in key:
            row[key] = req.rainfall
        if "temperature" in key.lower():
            row[key] = req.temperature

    df = pd.DataFrame([row], columns=feature_names)
    return df.fillna(0)


def compute_agri_score(req: PredictionRequest, predicted_income: int) -> float:
    score = 0.0

    # Income score (max 40 pts)
    score += min(predicted_income / 2_000_000, 1.0) * 40

    # Irrigation score (max 20 pts)
    score += (req.irrigated_percentage / 100) * 20

    # Rainfall score (max 15 pts)
    if 600 <= req.rainfall <= 1200:
        score += 15
    elif 300 <= req.rainfall < 600 or 1200 < req.rainfall <= 1800:
        score += 8
    else:
        score += 3

    # Land size score (max 15 pts)
    score += min(req.land_size / 20, 1.0) * 15

    # Market proximity score (max 10 pts)
    score += max(0, 10 - (req.market_distance / 5))

    return round(min(score, 100), 1)


def compute_loan_eligibility(predicted_income: int) -> str:
    if predicted_income >= 1_300_000:
        return "High"
    elif predicted_income >= 720_000:
        return "Medium"
    else:
        return "Low"


def predict_single(req: PredictionRequest) -> dict:
    # Step 1: Base income from ML model (captures land, non-agri income, financial factors)
    X = build_feature_vector(req)
    preds = [model.predict(X)[0] for model in models]
    base_income = int(np.expm1(np.mean(preds)))

    # Step 2: Compute agri income from yield inputs
    # total_produce (quintals) = yield_per_acre x land_size
    # gross_agri_income = total_produce x market_price_per_quintal
    # net after 20% cost deduction
    total_produce = req.yield_per_acre * req.land_size
    gross_agri = total_produce * req.market_price
    net_agri_income = int(gross_agri * 0.80)

    # Step 3: Apply crop / soil / season multipliers
    crop_mult   = CROP_YIELD_MULTIPLIER.get(req.crop_type, 1.0)
    soil_mult   = SOIL_MULTIPLIER.get(req.soil_type, 1.0)
    season_mult = SEASON_MULTIPLIER.get(req.season, 1.0)
    combined_mult = crop_mult * soil_mult * season_mult

    adjusted_agri_income = int(net_agri_income * combined_mult)

    # Step 4: Irrigation bonus on agri income (up to +25%)
    irrigation_factor = 1.0 + (req.irrigated_percentage / 100) * 0.25
    adjusted_agri_income = int(adjusted_agri_income * irrigation_factor)

    # Step 5: Final income = ML base income + adjusted agri income
    predicted_income = base_income + adjusted_agri_income

    agri_score = compute_agri_score(req, predicted_income)
    loan_eligibility = compute_loan_eligibility(predicted_income)

    return {
        "predicted_income": predicted_income,
        "agri_score": agri_score,
        "loan_eligibility": loan_eligibility,
        "breakdown": {
            "ml_base_income": base_income,
            "agri_income": adjusted_agri_income,
            "crop_multiplier": crop_mult,
            "soil_multiplier": soil_mult,
            "season_multiplier": season_mult,
            "irrigation_factor": round(irrigation_factor, 3),
        }
    }


# =========================
# ROUTES
# =========================
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/features")
def get_features():
    return {"features": list(feature_names[:30]), "total": len(feature_names)}


@app.post("/api/predict")
def predict(req: PredictionRequest):
    X = build_feature_vector(req)
    preds = [model.predict(X)[0] for model in models]
    fold_predictions = [int(np.expm1(p)) for p in preds]
    avg = int(np.mean(fold_predictions))
    return {
        "predicted_income": avg,
        "fold_predictions": fold_predictions,
    }


# =========================
# COMPARE ROUTE
# =========================
@app.post("/api/compare")
def compare(req: CompareRequest):
    result_a = predict_single(req.scenario_a)
    result_b = predict_single(req.scenario_b)

    income_a = result_a["predicted_income"]
    income_b = result_b["predicted_income"]

    income_diff = abs(income_a - income_b)
    income_diff_pct = round(
        (income_diff / max(income_a, income_b)) * 100, 1
    ) if max(income_a, income_b) > 0 else 0

    if income_a > income_b:
        better = "A"
        recommendation = (
            f"Scenario A yields ₹{income_diff:,} more income "
            f"({income_diff_pct}% higher). Scenario A is the better farming choice."
        )
    elif income_b > income_a:
        better = "B"
        recommendation = (
            f"Scenario B yields ₹{income_diff:,} more income "
            f"({income_diff_pct}% higher). Scenario B is the better farming choice."
        )
    else:
        better = "Tie"
        recommendation = "Both scenarios are projected to yield the same income."

    agri_score_diff = round(
        abs(result_a["agri_score"] - result_b["agri_score"]), 1
    )

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
# AI ROUTE — Groq
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