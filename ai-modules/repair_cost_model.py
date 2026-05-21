"""Scikit-learn training scaffold for real garage data.

The platform uses a deterministic live estimator in Node.js until enough real
repair records exist. Export completed repairs, then train this model.
"""

from pathlib import Path
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib


def train_repair_cost_model(csv_path: str, output_path: str = "repair_cost_model.joblib") -> str:
    data = pd.read_csv(Path(csv_path))
    required = {"issueType", "priority", "odometerKm", "year", "billAmount"}
    missing = required - set(data.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")

    features = data[["issueType", "priority", "odometerKm", "year"]]
    target = data["billAmount"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("category", OneHotEncoder(handle_unknown="ignore"), ["issueType", "priority"]),
            ("numeric", "passthrough", ["odometerKm", "year"]),
        ]
    )
    model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=160, random_state=42)),
    ])
    model.fit(features, target)
    joblib.dump(model, output_path)
    return output_path
