"""
Data preparation module: loading, cleaning, feature engineering, encoding.

Each function does one clear job. Call prepare_datasets() to get
ready-to-train X_train, y_train, X_test, and the FarmerIDs for test.
"""

import os
import pandas as pd
import numpy as np
import re
from sklearn.model_selection import KFold

# ── Configuration (previously in config.py) ──────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")

TRAIN_RAW = os.path.join(RAW_DIR, "LTF_Challenge_TrainData.csv")
TEST_RAW = os.path.join(RAW_DIR, "TestData.csv")

SEED = 42
N_FOLDS = 5
TARGET_COL_RAW = "Target_Variable/Total Income"
TE_SMOOTHING = 20

DROP_COLS = ["FarmerID", "Location", "Address type", "K022-Nearest Mandi Name"]

TARGET_ENCODE_COLS = ["State", "REGION", "CITY", "DISTRICT", "VILLAGE", "Zipcode"]
BINARY_ENCODE_COLS = ["SEX", "MARITAL_STATUS", "Ownership"]

ORDINAL_COLS = [
    "K022-Village category based on Agri parameters (Good, Average, Poor)",
    "K022-Village category based on socio-economic parameters (Good, Average, Poor)",
    "R022-Village category based on Agri parameters (Good, Average, Poor)",
    " Village category based on socio-economic parameters (Good, Average, Poor)",
]
ORDINAL_MAP = {"Poor": 0, "Average": 1, "Good": 2}

TEMPERATURE_COLS = [
    "K022-Ambient temperature (min & max)",
    "R022-Ambient temperature (min & max)",
    "K021-Ambient temperature (min & max)",
    "R021-Ambient temperature (min & max)",
    "R020-Ambient temperature (min & max)",
]

ONEHOT_COLS = [
    "Kharif Seasons Type of soil in 2020",
    "Rabi Seasons Type of soil in 2020",
    "Kharif Seasons Type of water bodies in hectares 2020",
    "Rabi Seasons Type of water bodies in hectares 2020",
    "Kharif Seasons  Type of soil in 2022",
    "Rabi Seasons Type of soil in 2022",
    "Kharif Seasons  Type of water bodies in hectares 2022",
    "Rabi Seasons Type of water bodies in hectares 2022",
    "Kharif Seasons Type of soil in 2021",
    "Rabi Seasons Type of soil in 2021",
    "Kharif Seasons Type of water bodies in hectares 2021",
    "Rabi Seasons Type of water bodies in hectares 2021",
]

LOG_TRANSFORM_COLS = [
    "No_of_Active_Loan_In_Bureau",
    "Non_Agriculture_Income",
    "Avg_Disbursement_Amount_Bureau",
]

LAND_COL = "Total_Land_For_Agriculture"
NON_AGRI_INCOME = "Non_Agriculture_Income"
SOCIO_SCORE = "KO22-Village score based on socio-economic parameters (0 to 100)"
MANDI_DIST = "K022-Proximity to nearest mandi (Km)"
RAILWAY_DIST = "K022-Proximity to nearest railway (Km)"
NIGHT_LIGHT = " Night light index"
ROAD_DENSITY = " Road density (Km/ SqKm)"
KCC_COL = "perc_Households_do_not_have_KCC_With_The_Credit_Limit_Of_50k"

INFRA_COLS = [
    "perc_of_pop_living_in_hh_electricity",
    "Perc_of_house_with_6plus_room",
    "perc_Households_with_Pucca_House_That_Has_More_Than_3_Rooms",
    "mat_roof_Metal_GI_Asbestos_sheets",
    "perc_of_Wall_material_with_Burnt_brick",
    "Households_with_improved_Sanitation_Facility",
]

AGRI_SCORE_COLS = {
    "kharif_2022": "Kharif Seasons  Agricultural Score in 2022",
    "rabi_2022": "Rabi Seasons Agricultural Score in 2022",
    "kharif_2021": "Kharif Seasons Agricultural Score in 2021",
    "rabi_2021": "Rabi Seasons Agricultural Score in 2021",
    "kharif_2020": "Kharif Seasons Agricultural Score in 2020",
    "rabi_2020": "Rabi Seasons Agricultural Score in 2020",
}

RAINFALL_COLS = [
    "K022-Seasonal Average Rainfall (mm)",
    "R022-Seasonal Average Rainfall (mm)",
    "K021-Seasonal Average Rainfall (mm)",
    "R021-Seasonal Average Rainfall (mm)",
    "R020-Seasonal Average Rainfall (mm)",
]


# ===================================================================
# 1. LOADING
# ===================================================================

def load_data():
    """Load raw train & test CSVs and clean column names."""
    train = pd.read_csv(TRAIN_RAW, low_memory=False)
    test = pd.read_csv(TEST_RAW, low_memory=False)

    # Strip whitespace from column names
    train.columns = train.columns.str.strip()
    test.columns = test.columns.str.strip()

    print(f"Loaded train: {train.shape}, test: {test.shape}")
    return train, test


# ===================================================================
# 2. CLEANING
# ===================================================================

def handle_missing(df):
    """Fill nulls: median for numeric, mode for categorical."""
    for col in df.select_dtypes(include="number").columns:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())

    for col in df.select_dtypes(include="object").columns:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")

    return df


def handle_outliers(df, target_col):
    """Cap target variable at 99th percentile to reduce extreme outliers."""
    if target_col in df.columns:
        cap = df[target_col].quantile(0.99)
        df[target_col] = df[target_col].clip(upper=cap)
        print(f"Capped {target_col} at {cap:,.0f}")
    return df


def parse_temperature(df, temp_cols):
    """Parse 'min & max' temperature strings into separate numeric columns."""
    for col in temp_cols:
        if col not in df.columns:
            continue
        df[col] = df[col].astype(str)
        splits = df[col].apply(lambda x: re.split(r'\s*&\s*|\s*/\s*', x))
        df[col + "_min"] = pd.to_numeric(splits.apply(lambda x: x[0] if len(x) > 0 else None), errors="coerce")
        df[col + "_max"] = pd.to_numeric(splits.apply(lambda x: x[1] if len(x) > 1 else None), errors="coerce")
        df[col + "_range"] = df[col + "_max"] - df[col + "_min"]
        df.drop(columns=[col], inplace=True)
    return df


def log_transform(df, cols, target_col=None):
    """Apply log1p to skewed numeric columns. Optionally also to target."""
    for col in cols:
        if col in df.columns:
            df[col] = np.log1p(df[col].clip(lower=0))
    if target_col and target_col in df.columns:
        df[target_col] = np.log1p(df[target_col].clip(lower=0))
    return df


# ===================================================================
# 3. ENCODING
# ===================================================================

def encode_binary(df, cols):
    """Label-encode binary / low-cardinality categoricals (0, 1, 2, ...)."""
    for col in cols:
        if col in df.columns:
            df[col] = df[col].astype("category").cat.codes
    return df


def encode_ordinal(df, cols, mapping):
    """Map ordinal categories to integers using the given mapping."""
    for col in cols:
        if col in df.columns:
            df[col] = df[col].map(mapping).fillna(-1).astype(int)
    return df


def encode_onehot(df, cols):
    """One-hot encode categorical columns (soil types, water bodies, etc.)."""
    for col in cols:
        if col in df.columns:
            df = pd.get_dummies(df, columns=[col], dummy_na=False)
    return df


def target_encode_kfold(train, test, cols, target_col, n_folds=5, smoothing=20, seed=42):
    """
    K-Fold target encoding to prevent leakage.

    For train: each row's encoding uses only data from OTHER folds.
    For test:  uses the full training set mean per category.
    Smoothing blends category mean with global mean for rare categories.
    """
    global_mean = train[target_col].mean()
    kf = KFold(n_splits=n_folds, shuffle=True, random_state=seed)

    for col in cols:
        if col not in train.columns:
            continue

        enc_col = f"{col}_te"

        # --- Train: out-of-fold encoding ---
        train[enc_col] = np.nan
        for fold_train_idx, fold_val_idx in kf.split(train):
            fold_train = train.iloc[fold_train_idx]
            stats = fold_train.groupby(col)[target_col].agg(["mean", "count"])
            smoothed = (stats["count"] * stats["mean"] + smoothing * global_mean) / (stats["count"] + smoothing)
            train.loc[train.index[fold_val_idx], enc_col] = (
                train.iloc[fold_val_idx][col].map(smoothed)
            )
        train[enc_col] = train[enc_col].fillna(global_mean)

        # --- Test: full training set encoding ---
        stats = train.groupby(col)[target_col].agg(["mean", "count"])
        smoothed = (stats["count"] * stats["mean"] + smoothing * global_mean) / (stats["count"] + smoothing)
        test[enc_col] = test[col].map(smoothed).fillna(global_mean)

    return train, test


# ===================================================================
# 4. FEATURE ENGINEERING
# ===================================================================

def create_village_population(train, test):
    """Village population proxy = count of farmers per village."""
    village_counts = train["VILLAGE"].value_counts().to_dict()
    train["Village_Population"] = train["VILLAGE"].map(village_counts)
    test["Village_Population"] = test["VILLAGE"].map(village_counts).fillna(1)
    return train, test


def engineer_features(df):
    """
    Create all derived features. Works on both train and test.
    All input columns should already be cleaned and numeric at this point.
    """
    # --- Interaction features ---
    if LAND_COL in df.columns and SOCIO_SCORE in df.columns:
        df["Land_x_SocioScore"] = df[LAND_COL] * df[SOCIO_SCORE]

    if NIGHT_LIGHT in df.columns and ROAD_DENSITY in df.columns:
        df["NightLight_x_RoadDensity"] = df[NIGHT_LIGHT] * df[ROAD_DENSITY]

    if NON_AGRI_INCOME in df.columns and LAND_COL in df.columns:
        df["Income_x_Land"] = df[NON_AGRI_INCOME] * df[LAND_COL]

    if SOCIO_SCORE in df.columns and MANDI_DIST in df.columns:
        df["SocioScore_x_MandiDist"] = df[SOCIO_SCORE] * df[MANDI_DIST]

    # --- Ratio features ---
    if "Avg_Disbursement_Amount_Bureau" in df.columns and NON_AGRI_INCOME in df.columns:
        df["Loan_to_Income_Ratio"] = df["Avg_Disbursement_Amount_Bureau"] / (df[NON_AGRI_INCOME] + 1)

    if LAND_COL in df.columns and "Village_Population" in df.columns:
        df["Land_per_Person"] = df[LAND_COL] / (df["Village_Population"] + 1)

    if MANDI_DIST in df.columns and RAILWAY_DIST in df.columns:
        df["Market_Access_Score"] = 1 / (1 + df[MANDI_DIST]) * 1 / (1 + df[RAILWAY_DIST])

    # --- Polynomial features ---
    if LAND_COL in df.columns:
        df["Land_sq"] = df[LAND_COL] ** 2

    if NON_AGRI_INCOME in df.columns:
        df["NonAgriIncome_sq"] = df[NON_AGRI_INCOME] ** 2

    # --- Infrastructure composite score ---
    infra_present = [c for c in INFRA_COLS if c in df.columns]
    if infra_present:
        df["Infrastructure_Score"] = df[infra_present].mean(axis=1)

    # --- Agricultural performance trend (2022 vs 2020) ---
    scores = AGRI_SCORE_COLS
    if scores["kharif_2022"] in df.columns and scores["kharif_2020"] in df.columns:
        df["Agri_Trend_Kharif"] = df[scores["kharif_2022"]] - df[scores["kharif_2020"]]
    if scores["rabi_2022"] in df.columns and scores["rabi_2020"] in df.columns:
        df["Agri_Trend_Rabi"] = df[scores["rabi_2022"]] - df[scores["rabi_2020"]]

    # Average agricultural score across all seasons/years
    score_cols = [c for c in scores.values() if c in df.columns]
    if score_cols:
        df["Avg_Agri_Score"] = df[score_cols].mean(axis=1)

    # --- Rainfall variability ---
    rain_present = [c for c in RAINFALL_COLS if c in df.columns]
    if len(rain_present) >= 2:
        df["Rainfall_Variability"] = df[rain_present].std(axis=1)
        df["Rainfall_Mean"] = df[rain_present].mean(axis=1)
        # Trend: most recent - oldest
        df["Rainfall_Trend"] = df[rain_present[0]] - df[rain_present[-1]]

    # --- KCC feature ---
    if KCC_COL in df.columns:
        df["KCC_Access"] = 100 - df[KCC_COL]  # invert: higher = more access

    return df


def add_state_aggregations(train, test, cols_to_agg, group_col="State"):
    """
    State-level mean aggregations. Uses K-Fold style to avoid leakage on train.
    """
    global_means = {}
    kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=SEED)

    for col in cols_to_agg:
        if col not in train.columns:
            continue

        agg_name = f"{group_col}_Avg_{col}"
        global_means[col] = train[col].mean()

        # Out-of-fold for train
        train[agg_name] = np.nan
        for fold_train_idx, fold_val_idx in kf.split(train):
            fold_train = train.iloc[fold_train_idx]
            state_means = fold_train.groupby(group_col)[col].mean().to_dict()
            train.loc[train.index[fold_val_idx], agg_name] = (
                train.iloc[fold_val_idx][group_col].map(state_means)
            )
        train[agg_name] = train[agg_name].fillna(global_means[col])

        # Full map for test
        state_means = train.groupby(group_col)[col].mean().to_dict()
        test[agg_name] = test[group_col].map(state_means).fillna(global_means[col])

    return train, test


# ===================================================================
# 5. CLEAN COLUMN NAMES (for LightGBM compatibility)
# ===================================================================

def clean_column_names(df):
    """Replace special characters in column names with underscores."""
    df.columns = [re.sub(r'[^A-Za-z0-9_]+', '_', col).strip('_') for col in df.columns]
    return df


# ===================================================================
# 6. MAIN: PREPARE DATASETS
# ===================================================================

def prepare_datasets():
    """
    Full pipeline: load → clean → encode → engineer → return ready data.

    Returns:
        X_train (DataFrame), y_train (Series), X_test (DataFrame), farmer_ids (Series)
    """
    print("=" * 60)
    print("STEP 1: Loading data")
    print("=" * 60)
    train, test = load_data()
    farmer_ids = test["FarmerID"].copy()

    print("\nSTEP 2: Cleaning")
    print("-" * 40)
    # Parse temperature before anything else (creates new columns)
    train = parse_temperature(train, TEMPERATURE_COLS)
    test = parse_temperature(test, TEMPERATURE_COLS)

    # Handle outliers in target
    train = handle_outliers(train, TARGET_COL_RAW)

    # Handle missing values
    train = handle_missing(train)
    test = handle_missing(test)

    print("\nSTEP 3: Encoding categoricals")
    print("-" * 40)
    # Binary & ordinal encoding
    train = encode_binary(train, BINARY_ENCODE_COLS)
    test = encode_binary(test, BINARY_ENCODE_COLS)
    train = encode_ordinal(train, ORDINAL_COLS, ORDINAL_MAP)
    test = encode_ordinal(test, ORDINAL_COLS, ORDINAL_MAP)

    # One-hot encode soil/water types
    train = encode_onehot(train, ONEHOT_COLS)
    test = encode_onehot(test, ONEHOT_COLS)

    # Village population (before target encoding)
    train, test = create_village_population(train, test)

    # Log transform skewed columns + target
    train = log_transform(train, LOG_TRANSFORM_COLS, target_col=TARGET_COL_RAW)
    test = log_transform(test, LOG_TRANSFORM_COLS)

    # K-Fold target encoding (leakage-free)
    print("  Applying K-Fold target encoding...")
    train, test = target_encode_kfold(
        train, test, TARGET_ENCODE_COLS,
        target_col=TARGET_COL_RAW,
        n_folds=N_FOLDS,
        smoothing=TE_SMOOTHING,
        seed=SEED,
    )
    # Show results of target encoding for visualization
    te_cols_to_show = [c for c in ["State", "State_te"] if c in train.columns]
    if te_cols_to_show:
        print("\nTarget Encoding Preview (State):")
        print(train[te_cols_to_show].head())

    print("\nSTEP 4: Feature engineering")
    print("-" * 40)
    train = engineer_features(train)
    test = engineer_features(test)

    # State-level aggregations (leakage-free)
    agg_cols = [c for c in [LAND_COL, NON_AGRI_INCOME, SOCIO_SCORE] if c in train.columns]
    train, test = add_state_aggregations(train, test, agg_cols)

    print("\nSTEP 5: Final cleanup")
    print("-" * 40)
    # Extract target
    y_train = train[TARGET_COL_RAW].copy()

    # Drop columns not needed for training
    cols_to_drop = DROP_COLS + TARGET_ENCODE_COLS + [TARGET_COL_RAW]
    train.drop(columns=[c for c in cols_to_drop if c in train.columns], inplace=True)
    test.drop(columns=[c for c in cols_to_drop if c in test.columns], inplace=True)

    # Clean column names for LightGBM
    train = clean_column_names(train)
    test = clean_column_names(test)

    # Align columns: ensure train and test have the same features
    common_cols = sorted(set(train.columns) & set(test.columns))
    # Only keep numeric columns
    train = train[common_cols].apply(pd.to_numeric, errors="coerce").fillna(0)
    test = test[common_cols].apply(pd.to_numeric, errors="coerce").fillna(0)

    # Save processed data to CSV
    PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    # Save training data (features + target)
    train_out = train.copy()
    train_out["target"] = y_train
    train_path = os.path.join(PROCESSED_DIR, "train_processed.csv")
    train_out.to_csv(train_path, index=False)
    
    # Save testing data (features + IDs)
    test_out = test.copy()
    test_out["FarmerID"] = farmer_ids
    test_path = os.path.join(PROCESSED_DIR, "test_processed.csv")
    test_out.to_csv(test_path, index=False)
    
    print(f"\nSTEP 6: Exporting")
    print("-" * 40)
    print(f"  Saved processed train: {train_path}")
    print(f"  Saved processed test:  {test_path}")

    return train, y_train, test, farmer_ids


# Quick test when run directly
if __name__ == "__main__":
    X_train, y_train, X_test, ids = prepare_datasets()
    print(f"\nDone! Train: {X_train.shape}, Test: {X_test.shape}")
    print(f"Target stats: mean={y_train.mean():.4f}, std={y_train.std():.4f}")
