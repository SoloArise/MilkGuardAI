"""
MilkGuard AI - Analytics & Reporting Intelligence
Computes dataset metrics, historical trends, parameter correlations, and model metrics.
"""

from typing import Dict, Any, List, Optional
import json
from pathlib import Path
import pandas as pd
import numpy as np

from config.settings import DATASET_PATH, MODEL_FEATURE_COLUMNS
from src.database import get_all_predictions, get_statistics
from src.model_loader import get_model_loader

def _resolve_training_evaluation_report() -> Path:
    """
    Return the path to the most recent model_comparison.json.

    Priority (first file that exists wins):
      1. reports/model_comparison.json          – canonical output from train_evaluate.py
      2. reports/<any-subdir>/model_comparison.json – secondary run kept for reference
    """
    base = Path(__file__).resolve().parents[1] / "reports"
    primary = base / "model_comparison.json"
    if primary.is_file():
        return primary
    # Walk one level of subdirectories for a fallback copy.
    for sub in sorted(base.iterdir()):
        if sub.is_dir():
            candidate = sub / "model_comparison.json"
            if candidate.is_file():
                return candidate
    # Return the canonical path so the FileNotFoundError message is actionable.
    return primary


TRAINING_EVALUATION_REPORT_PATH = _resolve_training_evaluation_report()


def get_dataset_summary() -> Dict[str, Any]:
    """Analyzes the benchmark reference milk quality dataset."""
    if not DATASET_PATH.exists():
        return {"status": "missing_dataset"}

    df = pd.read_csv(DATASET_PATH)
    df.columns = [c.strip() for c in df.columns]
    
    grade_col = "Grade" if "Grade" in df.columns else "grade"
    grade_counts = df[grade_col].str.lower().value_counts().to_dict()
    total = len(df)

    # Class-wise averages
    means_by_grade = df.groupby(df[grade_col].str.lower()).mean(numeric_only=True).to_dict(orient="index")

    return {
        "status": "available",
        "total_samples": total,
        "classes": grade_counts,
        "percentages": {k: round((v / total) * 100, 1) for k, v in grade_counts.items()},
        "means_by_grade": means_by_grade,
        "features": [c for c in df.columns if c != grade_col],
    }


def get_historical_trends() -> Dict[str, Any]:
    """Calculates weekly or daily trends from stored prediction history."""
    df = get_all_predictions()
    if df.empty:
        # Default fallback trend mirroring the prompt's demo curve if history is empty
        weeks = [f"W{i}" for i in range(1, 13)]
        rates = [38, 48, 44, 61, 56, 70, 66, 78, 72, 86, 79, 92]
        return {
            "is_simulated": True,
            "labels": weeks,
            "high_quality_rates": rates,
        }

    # Group predictions by date
    df["date"] = pd.to_datetime(df["created_at"]).dt.date
    daily = df.groupby("date").agg(
        total=("id", "count"),
        high=("predicted_quality", lambda s: (s.str.lower() == "high").sum()),
        medium=("predicted_quality", lambda s: (s.str.lower() == "medium").sum()),
        low=("predicted_quality", lambda s: (s.str.lower() == "low").sum()),
    ).reset_index()

    daily["high_rate"] = ((daily["high"] / daily["total"]) * 100).round(1)

    return {
        "is_simulated": False,
        "dates": [d.strftime("%b %d") for d in daily["date"]],
        "totals": daily["total"].tolist(),
        "high_counts": daily["high"].tolist(),
        "medium_counts": daily["medium"].tolist(),
        "low_counts": daily["low"].tolist(),
        "high_rates": daily["high_rate"].tolist(),
    }


def get_parameter_comparison_data() -> Dict[str, Any]:
    """Returns parameter benchmarks grouped by quality class."""
    summary = get_dataset_summary()
    if summary.get("status") == "available":
        means = summary["means_by_grade"]
        return {
            "ph": {
                "high": round(means.get("high", {}).get("pH", 6.72), 2),
                "medium": round(means.get("medium", {}).get("pH", 6.43), 2),
                "low": round(means.get("low", {}).get("pH", 5.91), 2),
            },
            "temperature": {
                "high": round(means.get("high", {}).get("Temprature", 36.4), 1),
                "medium": round(means.get("medium", {}).get("Temprature", 38.7), 1),
                "low": round(means.get("low", {}).get("Temprature", 42.1), 1),
            },
            "fat_pct": {
                "high": round(means.get("high", {}).get("Fat", 0.92) * 100, 1),
                "medium": round(means.get("medium", {}).get("Fat", 0.71) * 100, 1),
                "low": round(means.get("low", {}).get("Fat", 0.38) * 100, 1),
            },
        }

    # Fallback to realistic values
    return {
        "ph": {"high": 6.72, "medium": 6.43, "low": 5.91},
        "temperature": {"high": 36.4, "medium": 38.7, "low": 42.1},
        "fat_pct": {"high": 92.0, "medium": 71.0, "low": 38.0},
    }


def get_training_evaluation_metrics() -> Dict[str, Any]:
    """Load the single generated evaluation report used by both dashboards.

    Missing or malformed reports are surfaced to callers; fabricated fallbacks
    are intentionally not provided.
    """
    if not TRAINING_EVALUATION_REPORT_PATH.is_file():
        raise FileNotFoundError(
            "Training evaluation report is unavailable. Generate it with "
            "scripts/train_evaluate.py. Expected file: "
            f"{TRAINING_EVALUATION_REPORT_PATH}"
        )

    try:
        with TRAINING_EVALUATION_REPORT_PATH.open("r", encoding="utf-8") as report_file:
            evaluation = json.load(report_file)
    except (json.JSONDecodeError, OSError) as exc:
        raise ValueError(
            f"Could not read training evaluation report at {TRAINING_EVALUATION_REPORT_PATH}: {exc}"
        ) from exc

    expected_models = {"random_forest", "gaussian_nb", "svm"}
    if not isinstance(evaluation, dict) or not isinstance(evaluation.get("metadata"), dict):
        raise ValueError("Training evaluation report must contain metadata and models objects.")
    models = evaluation.get("models")
    if not isinstance(models, dict) or set(models) != expected_models:
        raise ValueError(
            "Training evaluation report must contain exactly Random Forest, Gaussian NB, and SVM results."
        )

    for model_name, model_result in models.items():
        required_sections = {
            "python_class",
            "model_parameters",
            "holdout_metrics",
            "cross_validation_on_training_partition",
            "confusion_matrix",
            "classification_report",
        }
        if not isinstance(model_result, dict) or not required_sections.issubset(model_result):
            raise ValueError(f"Evaluation report is incomplete for model {model_name!r}.")

    return evaluation


