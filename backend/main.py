import os
import json
import numpy as np
import pandas as pd
import joblib
import shap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
print(f"  - {len(feature_names)} features expected")

with open(DEFAULTS_PATH) as f:
    feature_defaults = json.load(f)
print(f"  - Defaults loaded for {len(feature_defaults)} features")

print("Initializing SHAP explainer...")
explainer = shap.TreeExplainer(models[0])

app = FastAPI(title="Uzhavan IQ", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def build_feature_vector(req: PredictionRequest) -> pd.DataFrame:
    """Map 10 user inputs → 286-feature vector using training medians as defaults."""

    row = {feat: feature_defaults.get(feat, 0.0) for feat in feature_names}

    f_land = min(req.land_size / 5.0, 3.0)
    f_yield = min(req.yield_per_acre / 20.0, 2.0)
    f_irrig = 0.5 + (req.irrigated_percentage / 100.0)
    f_price = min(req.market_price / 2500.0, 2.0)

    prosperity_score = f_land * f_yield * f_irrig * f_price

    wealth_features = [
        "Avg_Disbursement_Amount_Bureau",
        "No_of_Active_Loan_In_Bureau",
        "Households_with_improved_Sanitation_Facility",
        "perc_of_pop_living_in_hh_electricity",
        "perc_Households_with_Pucca_House_That_Has_More_Than_3_Rooms",
        "Perc_of_house_with_6plus_room",
        "mat_roof_Metal_GI_Asbestos_sheets",
        "perc_of_Wall_material_with_Burnt_brick",
        "Infrastructure_Score",
        "Market_Access_Score",
        "State_Avg_Non_Agriculture_Income",
        "State_Avg_Total_Land_For_Agriculture",
        "K021_Seasonal_Average_Rainfall_mm",
    ]

    for feat in wealth_features:
        if feat in row:

            multiplier = getattr(req, "land_size", 5) / 5.0 if feat == "State_Avg_Total_Land_For_Agriculture" else prosperity_score
            multiplier = max(0.05, min(multiplier, 3.0))

            if req.land_size < 2.0:
                 multiplier *= 0.1

            row[feat] = row[feat] * multiplier

    if req.land_size < 2.0:
        row["KCC_Access"] = 0
        row["No_of_Active_Loan_In_Bureau"] = 0
        row["Avg_Disbursement_Amount_Bureau"] = 0
        row["Non_Agriculture_Income"] = 0
        row["State_Avg_Non_Agriculture_Income"] *= 0.1

    row["Total_Land_For_Agriculture"] = req.land_size
    # Keep Non_Agri_Income conservative so it doesn't dominate SHAP explanations
    # For wealthy profiles, give it a tiny bump rather than a massive 3x multiplier
    row["Non_Agriculture_Income"] = row["Non_Agriculture_Income"] * min(1.2, prosperity_score) if req.land_size >= 2.0 else 0
    row["K022_Proximity_to_nearest_mandi_Km"] = req.market_distance
    row["K022_Net_Agri_area_in_Ha"] = req.land_size * 0.4047

    for prefix in ["K021", "K022", "R020", "R021", "R022"]:
         if f"{prefix}_Ambient_temperature_min_max__max" in row:
             row[f"{prefix}_Ambient_temperature_min_max__max"] = req.temperature + 5
         if f"{prefix}_Ambient_temperature_min_max__min" in row:
             row[f"{prefix}_Ambient_temperature_min_max__min"] = req.temperature - 5
         if f"{prefix}_Ambient_temperature_min_max__range" in row:
             row[f"{prefix}_Ambient_temperature_min_max__range"] = 10

    for prefix in ["K021", "K022", "R020", "R021", "R022"]:
         key = f"{prefix}_Seasonal_Average_Rainfall_mm"
         if key in row:
             row[key] = req.rainfall

    irr_fraction = req.irrigated_percentage / 100.0
    irr_area = req.land_size * 0.4047 * irr_fraction
    for col in feature_names:
        if "Irrigated_area" in col:
            row[col] = irr_area

    agri_score = 50 + irr_fraction * 30 + min(req.yield_per_acre, 30) / 30 * 20
    for col in feature_names:
        if "Agricultural_Score" in col:
            row[col] = agri_score
        elif "Agricultural_performance" in col:
            row[col] = min(agri_score / 20, 5)

    crop_density = min(req.yield_per_acre / 20, 2.0)
    for col in feature_names:
        if "Cropping_density" in col:
            row[col] = crop_density

    row["Land_sq"] = req.land_size ** 2
    row["Land_per_Person"] = req.land_size / 4
    # NonAgriIncome_sq, Income_x_Land, Loan_to_Income_Ratio: keep training defaults (0.0)
    # Recomputing them from the ₹1L median creates values like 10 billion that dominate predictions

    # Additional derived features

    row["Rainfall_Mean"] = req.rainfall
    row["Rainfall_Trend"] = 0
    row["Rainfall_Variability"] = req.rainfall * 0.1

    row["Agri_Trend_Kharif"] = 0
    row["Agri_Trend_Rabi"] = 0
    row["Avg_Agri_Score"] = agri_score

    row["Infrastructure_Score"] = 50 + irr_fraction * 30
    row["Market_Access_Score"] = max(0, 100 - req.market_distance * 2)
    row["KCC_Access"] = 1 if req.land_size > 2 else 0

    row["Land_x_SocioScore"] = req.land_size * 50
    row["SocioScore_x_MandiDist"] = 50 * req.market_distance

    if "Land_Holding_Index_source_Total_Agri_Area_no_of_people" in row:
        row["Land_Holding_Index_source_Total_Agri_Area_no_of_people"] = req.land_size / 4

    df = pd.DataFrame([row], columns=feature_names)
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)
    return df

@app.get("/api/health")
def health():
    return {"status": "ok", "models_loaded": len(models), "features": len(feature_names)}

def post_process_income(raw_income, req: PredictionRequest):
    """Apply business logic to dampen raw ML outputs for extreme cases."""
    f_land = min(req.land_size / 5.0, 3.0)
    f_yield = min(req.yield_per_acre / 20.0, 2.0)
    f_irrig = 0.5 + (req.irrigated_percentage / 100.0)
    f_price = min(req.market_price / 2500.0, 2.0)
    prosperity = f_land * f_yield * f_irrig * f_price

    processed = raw_income

    if req.market_distance > 20:
        penalty = min(req.market_distance / 100.0, 0.4)
        processed = int(processed * (1.0 - penalty))

    if prosperity < 0.4:
         processed = int(processed * (0.5 + prosperity))

    return max(processed, 15000)

@app.post("/api/predict")
def predict(req: PredictionRequest):
    print(f"Received prediction request: {req}")

    X = build_feature_vector(req)

    preds_log = []
    for model in models:
        pred = model.predict(X, num_iteration=model.best_iteration)[0]
        preds_log.append(pred)

    processed_folds = [post_process_income(int(np.expm1(p)), req) for p in preds_log]

    avg_log = np.mean(preds_log)
    raw_avg_income = int(np.expm1(avg_log))
    predicted_income = post_process_income(raw_avg_income, req)

    # Calculate SHAP impacts
    shap_vals = explainer.shap_values(X)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1] # Sometimes lightgbm returns a list for multiclass, but regressor is an array.
    
    # SHAP values are in log-space. Approximate Rupee impact: Delta_Rupees ≈ Delta_Log * Predicted_Income
    impacts = [{"feature": f, "value": float(v) * predicted_income} for f, v in zip(feature_names, shap_vals[0])]
    impacts.sort(key=lambda x: abs(x["value"]), reverse=True)
    
    pos_impacts = [x for x in impacts if x["value"] > 0][:4]
    neg_impacts = [x for x in impacts if x["value"] < 0][:4]

    if predicted_income >= 800000:
        loan_eligibility = "High"
    elif predicted_income >= 350000:
        loan_eligibility = "Medium"
    else:
        loan_eligibility = "Low"

    return {
        "predicted_income": predicted_income,
        "loan_eligibility": loan_eligibility,
        "model_version": "v2.0-lightgbm",
        "features_used": len(feature_names),
        "fold_predictions": processed_folds,
        "shap_values": {
            "positive": pos_impacts,
            "negative": neg_impacts
        }
    }

class CompareRequest(BaseModel):
    scenario_a: PredictionRequest
    scenario_b: PredictionRequest

def compute_agri_score(req: PredictionRequest) -> float:
    # """Compute a composite AgriScore (0-100) from the 10 input parameters."""
    # Land productivity (0-1): bigger land + higher yield = better
    land_prod = min((req.land_size * req.yield_per_acre) / 300.0, 1.0)

    # Irrigation coverage (0-1)
    irrigation = req.irrigated_percentage / 100.0

    # Climate suitability (0-1): ideal rainfall 600-1200mm, temp 20-32°C
    rain_score = max(0, 1.0 - abs(req.rainfall - 900) / 900.0)
    temp_score = max(0, 1.0 - abs(req.temperature - 26) / 20.0)
    climate = (rain_score + temp_score) / 2.0

    # Market access (0-1): closer market + higher price = better
    dist_score = max(0, 1.0 - req.market_distance / 100.0)
    price_score = min(req.market_price / 5000.0, 1.0)
    market = (dist_score * 0.5 + price_score * 0.5)

    # Yield efficiency (0-1)
    yield_eff = min(req.yield_per_acre / 40.0, 1.0)

    # Weighted composite
    score = (
        land_prod * 0.25 +
        irrigation * 0.15 +
        climate * 0.15 +
        market * 0.20 +
        yield_eff * 0.25
    ) * 100.0

    return round(min(max(score, 0), 100), 1)

def run_single_prediction(req: PredictionRequest):
    """Run prediction for a single scenario and return income + metadata."""
    X = build_feature_vector(req)

    preds_log = []
    for model in models:
        pred = model.predict(X, num_iteration=model.best_iteration)[0]
        preds_log.append(pred)

    processed_folds = [post_process_income(int(np.expm1(p)), req) for p in preds_log]
    avg_log = np.mean(preds_log)
    raw_avg_income = int(np.expm1(avg_log))
    predicted_income = post_process_income(raw_avg_income, req)

    if predicted_income >= 800000:
        loan_eligibility = "High"
    elif predicted_income >= 350000:
        loan_eligibility = "Medium"
    else:
        loan_eligibility = "Low"

    return {
        "predicted_income": predicted_income,
        "loan_eligibility": loan_eligibility,
        "fold_predictions": processed_folds,
    }

@app.post("/api/compare")
def compare(req: CompareRequest):
    print(f"Compare request received")

    result_a = run_single_prediction(req.scenario_a)
    result_b = run_single_prediction(req.scenario_b)

    score_a = compute_agri_score(req.scenario_a)
    score_b = compute_agri_score(req.scenario_b)

    income_a = result_a["predicted_income"]
    income_b = result_b["predicted_income"]

    diff = income_b - income_a
    diff_pct = round((diff / income_a) * 100, 1) if income_a > 0 else 0
    score_diff = round(score_b - score_a, 1)

    if income_a > income_b:
        better = "A"
    elif income_b > income_a:
        better = "B"
    else:
        better = "Tie"

    better_label = f"Scenario {better}" if better != "Tie" else "Both scenarios are equal"
    winner_income = max(income_a, income_b)
    winner_score = score_a if better == "A" else score_b if better == "B" else score_a
    loser_score = score_b if better == "A" else score_a if better == "B" else score_a

    recommendation = (
        f"{better_label} yields {abs(diff_pct)}% higher income "
        f"with AgriScore {winner_score} vs {loser_score}"
    ) if better != "Tie" else "Both scenarios predict identical income"

    return {
        "scenario_a": {**result_a, "agri_score": score_a},
        "scenario_b": {**result_b, "agri_score": score_b},
        "comparison": {
            "income_difference": abs(diff),
            "income_difference_pct": abs(diff_pct),
            "agri_score_difference": abs(score_diff),
            "better_scenario": better,
            "recommendation": recommendation,
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

