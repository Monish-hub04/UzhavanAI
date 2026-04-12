"""Save feature medians from trained model + training data for API use."""
import os, sys, json
import numpy as np
import pandas as pd
import joblib

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE, "models")

# Load model to get feature names
model = joblib.load(os.path.join(MODEL_DIR, "lgb_fold1.pkl"))
feature_names = model.feature_name()

# Load raw training data to compute medians per feature
# We need the processed data, but we can approximate by loading and doing minimal prep
train = pd.read_csv(os.path.join(BASE, "data", "raw", "LTF_Challenge_TrainData.csv"))

# Clean column names same as data_prep.py
train.columns = (
    train.columns.str.strip()
    .str.replace(" ", "_")
    .str.replace("/", "_")
    .str.replace("-", "_")
    .str.replace("(", "")
    .str.replace(")", "")
    .str.replace("%", "Perc")
)

# Columns that were log1p-transformed in data_prep.py (LOG_TRANSFORM_COLS).
# Defaults must be stored in log-space so build_feature_vector() can pass them
# directly to the model without any further transformation.
LOG_TRANSFORM_COLS = {
    "Non_Agriculture_Income",
    "Avg_Disbursement_Amount_Bureau",
    "No_of_Active_Loan_In_Bureau",
}

# Get numeric median (or mean where more appropriate) for all columns
medians = {}
for col in train.columns:
    try:
        vals = pd.to_numeric(train[col], errors="coerce").clip(lower=0)
        med = vals.median()
        if pd.notna(med):
            # Store log-transformed value for columns that were log1p'd during training
            col_key = col  # raw column name from CSV (after clean-up above)
            medians[col_key] = float(np.log1p(med)) if col_key in LOG_TRANSFORM_COLS else float(med)
    except Exception:
        pass

# Map to model feature names — use 0 as default for features we can't compute
feature_defaults = {}
for feat in feature_names:
    if feat in medians:
        feature_defaults[feat] = medians[feat]
    else:
        feature_defaults[feat] = 0.0

# Save
out_path = os.path.join(MODEL_DIR, "feature_defaults.json")
with open(out_path, "w") as f:
    json.dump(feature_defaults, f, indent=2)

print(f"Saved {len(feature_defaults)} feature defaults to {out_path}") 