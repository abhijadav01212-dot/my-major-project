"""Offline analytics module for TorqueIQ Nexus.

Run this script after exporting MongoDB repair/customer collections to CSV.
It intentionally ships without sample customer data.
"""

from pathlib import Path
import pandas as pd


def summarize_repairs(csv_path: str) -> dict:
    repairs = pd.read_csv(Path(csv_path))
    if repairs.empty:
        return {"message": "No repair records available yet."}

    return {
        "repair_count": int(len(repairs)),
        "revenue": float(repairs.get("billAmount", pd.Series(dtype=float)).fillna(0).sum()),
        "status_mix": repairs.get("status", pd.Series(dtype=str)).value_counts().to_dict(),
        "average_bill": float(repairs.get("billAmount", pd.Series(dtype=float)).fillna(0).mean()),
    }


if __name__ == "__main__":
    print("Import summarize_repairs(csv_path) from this module after exporting real MongoDB data.")
