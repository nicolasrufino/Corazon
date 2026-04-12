# Corazon_AI — Training Pipeline

Source files for retraining the personalization + time models. **Not
loaded at runtime** — the FastAPI server only reads the pre-trained
`.pkl` files in `backend/ai/models/`. This folder is here so the team
can regenerate them when the input distribution changes or new
features are added.

## Files

| File | Purpose |
|---|---|
| `train_models.py` | Loads the CSVs, trains 5 RandomForest models, saves to `models/`, prints accuracy metrics |
| `data/generate_data.py` | Synthesizes `personalization_training_data.csv` + `time_training_data.csv` from archetype rules |
| `data/personalization_training_data.csv` | 3280 rows of synthetic user-org interactions for `personalization_model.pkl` |
| `data/time_training_data.csv` | Synthetic users → hours/yr lost for `time_model.pkl` (4 sub-models: nav / poverty / total / lifetime) |
| `mock_orgs.json` | Static org dictionary used by `algorithms.py`'s standalone test runner |

## Retraining locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Optional: regenerate the synthetic data first
cd ai/training/data
python3 generate_data.py
cd ..

# Train all models — writes to ./models/ relative to CWD
python3 train_models.py
```

Then move the new `.pkl` files into `backend/ai/models/`:

```bash
mv ai/training/models/*.pkl backend/ai/models/
```

(`train_models.py` writes to `./models/` relative to wherever it's
run from. Easiest is to `cd backend/ai/training` first.)

## Why we re-trained on a bigger dataset

Per Eddie's `02443d0` commit on `edug-0/ai-layer`:

> scale training data to 3280 rows, 97.4% personalization accuracy, no warnings

The new `personalization_model.pkl` (~880 KB) ships in
`backend/ai/models/`. The new `time_model.pkl` (~21 MB) also ships in
that folder so `algorithms.estimate_impact()` returns real ML
predictions instead of falling back to hardcoded archetype defaults.

## Verifying the trained model loads

From the project root:

```bash
cd backend
python3 -m venv .venv-test
source .venv-test/bin/activate
pip install joblib numpy pandas scikit-learn

python3 -c "
import sys; sys.path.insert(0, '.')
import os; os.environ['SUPABASE_URL']='x'; os.environ['SUPABASE_SERVICE_KEY']='x'
from ai.algorithms import build_simple_archetype, estimate_impact, _nav_model
print('ML model loaded:', _nav_model is not None)
s = build_simple_archetype('undocumented', 'es', 'unemployed')
print('estimate_impact:', estimate_impact(s))
"

deactivate && rm -rf .venv-test
```

Should print `ML model loaded: True` and a dict with `nav_hours`,
`poverty_hours`, `total_hours_yr`, etc.

If it prints `ML model loaded: False`, the `.pkl` file is missing
from `backend/ai/models/` — pull it from `origin/edug-0/ai-layer`:

```bash
git show origin/edug-0/ai-layer:Corazon_AI/models/time_model.pkl \
  > backend/ai/models/time_model.pkl
```
