# train_models.py
#
# PURPOSE: Load generated CSVs, train one model per prediction target,
# evaluate them, and save everything to models/ as .pkl files.
#
# WHY RandomForest:
#   - Handles categorical features well after label encoding
#   - Does not need feature scaling
#   - Robust to the noise added during data generation
#   - Trains in under 1 second on this data size
#   - predict_proba() gives ranking score for orgs, not just yes/no
#
# WHY SEPARATE MODELS PER TARGET:
#   Easier to evaluate, debug, and explain individually.
#   Each model is independently interpretable.

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score, classification_report
import joblib
import os

os.makedirs("models", exist_ok=True)


# ── SHARED HELPER ────────────────────────────────────────────────────────────

def train_regressor(X_train, y_train, X_test, y_test, label):
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"  {label} MAE: {mae:.2f}")
    return model


# ── MODEL 1: Impact Regressors ───────────────────────────────────────────────

print("=" * 55)
print("TRAINING MODEL 1: Impact Regressors")
print("=" * 55)

df_time = pd.read_csv("data/time_training_data.csv")
print(f"Loaded {len(df_time)} rows")
print(f"Columns: {list(df_time.columns)}")

# encode categorical columns to numbers
# LabelEncoder assigns alphabetical integer codes
# we save encoders so algorithms.py encodes new inputs identically
status_encoder   = LabelEncoder()
language_encoder = LabelEncoder()

df_time["status_encoded"]   = status_encoder.fit_transform(df_time["status_bucket"])
df_time["language_encoded"] = language_encoder.fit_transform(df_time["language"])

print(f"Status classes:   {list(status_encoder.classes_)}")
print(f"Language classes: {list(language_encoder.classes_)}")

# features — all numeric after encoding
X = df_time[["status_encoded", "num_goals", "language_encoded", "avg_goal_difficulty"]]

# four targets — all expressed in hours or days
y_nav      = df_time["nav_hours"]
y_poverty  = df_time["poverty_hours"]
y_total    = df_time["total_hours_lost"]
y_lifetime = df_time["lifetime_days"]

# single train/test split, reused across all targets for consistency
X_train, X_test, y_train_n, y_test_n = train_test_split(
    X, y_nav, test_size=0.2, random_state=42
)
_, _, y_train_p, y_test_p = train_test_split(X, y_poverty,  test_size=0.2, random_state=42)
_, _, y_train_t, y_test_t = train_test_split(X, y_total,    test_size=0.2, random_state=42)
_, _, y_train_l, y_test_l = train_test_split(X, y_lifetime, test_size=0.2, random_state=42)

print(f"\nTraining on {len(X_train)} rows, evaluating on {len(X_test)} rows\n")

nav_model      = train_regressor(X_train, y_train_n, X_test, y_test_n, "Navigation hours  ")
poverty_model  = train_regressor(X_train, y_train_p, X_test, y_test_p, "Poverty hours     ")
total_model    = train_regressor(X_train, y_train_t, X_test, y_test_t, "Total hours/yr    ")
lifetime_model = train_regressor(X_train, y_train_l, X_test, y_test_l, "Lifetime days     ")

# sanity checks — eyeball whether predictions make intuitive sense
print("\nSanity checks:")
test_cases = [
    {"status": "undocumented",       "num_goals": 3, "language": "es", "avg_diff": 13.0},
    {"status": "citizen",            "num_goals": 1, "language": "en", "avg_diff": 7.0},
    {"status": "DACA",               "num_goals": 2, "language": "es", "avg_diff": 11.0},
    {"status": "permanent_resident", "num_goals": 2, "language": "en", "avg_diff": 10.0},
]
for case in test_cases:
    s = status_encoder.transform([case["status"]])[0]
    l = language_encoder.transform([case["language"]])[0]
    f = pd.DataFrame(
        [[s, case["num_goals"], l, case["avg_diff"]]],
        columns=["status_encoded", "num_goals", "language_encoded", "avg_goal_difficulty"],
    )
    nav  = nav_model.predict(f)[0]
    pov  = poverty_model.predict(f)[0]
    tot  = total_model.predict(f)[0]
    life = lifetime_model.predict(f)[0]
    print(f"\n  {case['status']:20s} | {case['language']} | {case['num_goals']} goals")
    print(f"    nav burden:      {nav:.1f} hrs/yr")
    print(f"    poverty premium: {pov:.1f} hrs/yr  (dollars lost ÷ $22.58 BLS wage)")
    print(f"    total lost:      {tot:.1f} hrs/yr")
    print(f"    lifetime:        {life:.1f} days over 20 years")

# save all four models + both encoders in one bundle
joblib.dump({
    "nav_model":        nav_model,
    "poverty_model":    poverty_model,
    "total_model":      total_model,
    "lifetime_model":   lifetime_model,
    "status_encoder":   status_encoder,
    "language_encoder": language_encoder
}, "models/time_model.pkl")
print(f"\nSaved → models/time_model.pkl")


# ── MODEL 2: Personalization Classifier ─────────────────────────────────────

print("\n" + "=" * 55)
print("TRAINING MODEL 2: Personalization Classifier")
print("=" * 55)

df_pers = pd.read_csv("data/personalization_training_data.csv")
print(f"Loaded {len(df_pers)} rows")
print(f"Class balance:\n{df_pers['relevant'].value_counts().to_string()}")

# all 4 features already numeric — no encoding needed
X2 = df_pers[["goal_overlap", "language_match", "eligibility_match", "zip_match"]]
y2 = df_pers["relevant"]

X_train2, X_test2, y_train2, y_test2 = train_test_split(
    X2, y2, test_size=0.2, random_state=42
)
print(f"\nTraining on {len(X_train2)} rows, evaluating on {len(X_test2)} rows")

# class_weight="balanced" prevents model from just predicting majority class
pers_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    class_weight="balanced",
    random_state=42
)
pers_model.fit(X_train2, y_train2)

preds2   = pers_model.predict(X_test2)
accuracy = accuracy_score(y_test2, preds2)
print(f"\nAccuracy: {accuracy * 100:.1f}%")
print(f"\nDetailed report:")
print(classification_report(y_test2, preds2, target_names=["not relevant", "relevant"]))

# predict_proba sanity checks
# these are the probability values used to rank orgs in algorithms.py
print("Sanity checks (probability of being relevant):")
sanity_cases = [
    ([4, 1, 1, 1], "high overlap + all factors match   → expect > 0.85"),
    ([0, 1, 1, 1], "no goal overlap                    → expect < 0.15"),
    ([2, 1, 1, 0], "moderate overlap, lang+elig match  → expect ~0.60-0.80"),
    ([1, 0, 0, 0], "low overlap, nothing matches       → expect < 0.20"),
    ([3, 1, 0, 1], "good overlap, lang+zip but no elig → expect ~0.50-0.70"),
]
for features, description in sanity_cases:
    f = pd.DataFrame(
        [features],
        columns=["goal_overlap", "language_match", "eligibility_match", "zip_match"],
    )
    prob = pers_model.predict_proba(f)[0][1]
    print(f"  {prob:.2f}  {description}")

joblib.dump(pers_model, "models/personalization_model.pkl")
print(f"\nSaved → models/personalization_model.pkl")

print("\n" + "=" * 55)
print("ALL MODELS TRAINED AND SAVED")
print("Nav hours, poverty hours, total, lifetime, personalization")
print("Next: verify models/ contains both .pkl files then run algorithms.py")
print("=" * 55)