#!/usr/bin/env python3
"""Reproducibly compare candidate classifiers on the MilkGuardAI dataset.

Run from the repository root with ``python scripts/train_evaluate.py``.
The script never edits the source CSV or the production model artifacts. It
refuses to overwrite any of its output paths.
"""

from __future__ import annotations

import hashlib
import json
import math
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    make_scorer,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "data" / "milk_quality_dataset.csv"
REPORTS_DIR = ROOT / "reports"
MODELS_DIR = ROOT / "models"
FEATURES = ["pH", "Temprature", "Taste", "Odor", "Fat", "Turbidity", "Colour"]
TARGET = "Grade"
TARGET_LABELS = {"high", "medium", "low"}
SEED = 42
CV_FOLDS = 5


class PipelineError(RuntimeError):
    """Raised when the dataset or requested evaluation cannot be used safely."""


def output_paths() -> dict[str, Path]:
    """Return every output path so collisions can be detected before training."""
    return {
        "model_comparison_json": REPORTS_DIR / "model_comparison.json",
        "model_comparison_csv": REPORTS_DIR / "model_comparison.csv",
        "random_forest_confusion": REPORTS_DIR / "random_forest_confusion_matrix.csv",
        "random_forest_classification": REPORTS_DIR / "random_forest_classification_report.json",
        "gaussian_nb_confusion": REPORTS_DIR / "gaussian_nb_confusion_matrix.csv",
        "gaussian_nb_classification": REPORTS_DIR / "gaussian_nb_classification_report.json",
        "svm_confusion": REPORTS_DIR / "svm_confusion_matrix.csv",
        "svm_classification": REPORTS_DIR / "svm_classification_report.json",
        "random_forest_candidate": MODELS_DIR / "random_forest_candidate.joblib",
        "gaussian_nb_candidate": MODELS_DIR / "gaussian_nb_candidate.joblib",
        "svm_candidate": MODELS_DIR / "svm_candidate.joblib",
    }


def json_safe(value: Any) -> Any:
    """Convert common estimator and NumPy values to JSON-compatible values."""
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(v) for v in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return repr(value)


def load_and_validate_dataset(path: Path) -> tuple[pd.DataFrame, pd.Series, dict[str, Any]]:
    """Load, validate, and deduplicate the source dataset without modifying it."""
    if not path.is_file():
        raise PipelineError(f"Dataset file was not found: {path}")

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    try:
        frame = pd.read_csv(path)
    except Exception as exc:
        raise PipelineError(f"Could not read dataset CSV {path}: {exc}") from exc

    original_rows = len(frame)
    frame.columns = [str(column).strip() for column in frame.columns]
    if len(set(frame.columns)) != len(frame.columns):
        raise PipelineError("Column names are not unique after stripping whitespace.")

    required = FEATURES + [TARGET]
    missing_columns = [column for column in required if column not in frame.columns]
    if missing_columns:
        raise PipelineError(f"Missing required dataset columns: {missing_columns}")

    data = frame[required].copy()
    missing_counts = data.isna().sum()
    if int(missing_counts.sum()) > 0:
        details = {str(k): int(v) for k, v in missing_counts.items() if v}
        raise PipelineError(f"Missing values found; clean the source dataset first: {details}")

    # Deduplicate before splitting, on exact full rows (features plus target).
    duplicate_count = int(data.duplicated(keep="first").sum())
    data = data.drop_duplicates(keep="first").copy()
    if data.empty:
        raise PipelineError("No rows remain after duplicate removal.")

    data[TARGET] = data[TARGET].astype(str).str.strip().str.lower()
    observed_labels = set(data[TARGET].unique())
    invalid_labels = sorted(observed_labels - TARGET_LABELS)
    if invalid_labels:
        raise PipelineError(
            f"Invalid target labels {invalid_labels}; expected only {sorted(TARGET_LABELS)}."
        )

    for feature in FEATURES:
        converted = pd.to_numeric(data[feature], errors="coerce")
        bad = converted.isna()
        if bad.any():
            rows = (data.index[bad] + 2).tolist()[:10]
            raise PipelineError(
                f"Feature {feature!r} contains non-numeric values near CSV rows {rows}."
            )
        if not np.isfinite(converted.to_numpy(dtype=float)).all():
            raise PipelineError(f"Feature {feature!r} contains infinite values.")
        data[feature] = converted

    bounds = {"pH": (0, 14), "Temprature": (0, 100), "Colour": (0, 255)}
    for feature, (minimum, maximum) in bounds.items():
        invalid = ~data[feature].between(minimum, maximum, inclusive="both")
        if invalid.any():
            values = data.loc[invalid, feature].head(10).tolist()
            raise PipelineError(
                f"Feature {feature!r} must be between {minimum} and {maximum}; found {values}."
            )

    binary_features = ["Taste", "Odor", "Fat", "Turbidity"]
    for feature in binary_features:
        invalid = ~data[feature].isin([0, 1])
        if invalid.any():
            values = data.loc[invalid, feature].unique().tolist()[:10]
            raise PipelineError(f"Feature {feature!r} must contain only 0/1; found {values}.")

    class_counts = data[TARGET].value_counts().reindex(sorted(TARGET_LABELS), fill_value=0)
    too_small = class_counts[class_counts < CV_FOLDS]
    if not too_small.empty:
        raise PipelineError(
            f"Stratified {CV_FOLDS}-fold CV requires at least {CV_FOLDS} rows per class; "
            f"insufficient class counts: {too_small.to_dict()}"
        )

    metadata = {
        "dataset_filename": path.name,
        "dataset_sha256": digest,
        "original_sample_count": int(original_rows),
        "duplicate_rows_removed": duplicate_count,
        "deduplicated_sample_count": int(len(data)),
        "original_class_distribution": {
            str(k).strip().lower(): int(v)
            for k, v in frame[TARGET].astype(str).str.strip().str.lower().value_counts().items()
        },
        "deduplicated_class_distribution": {
            str(k): int(v) for k, v in class_counts.items()
        },
        "missing_values_checked": True,
        "invalid_feature_values_checked": True,
        "target_labels_checked": True,
        "features": FEATURES,
        "target": TARGET,
        "small_unique_dataset_notice": (
            f"Only {len(data)} unique observations remain after exact-row deduplication; "
            "metrics may be sensitive to individual observations."
        ),
    }
    return data[FEATURES], data[TARGET], metadata


def build_models() -> dict[str, Any]:
    """Create fresh estimators; scaling stays inside the SVM pipeline."""
    return {
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            random_state=SEED,
            class_weight="balanced",
        ),
        "gaussian_nb": GaussianNB(),
        "svm": Pipeline(
            steps=[
                ("standardscaler", StandardScaler()),
                ("svc", SVC(random_state=SEED)),
            ]
        ),
    }


def class_distribution(labels: pd.Series) -> dict[str, int]:
    return {str(k): int(v) for k, v in labels.value_counts().sort_index().items()}


def evaluate_models(
    features: pd.DataFrame,
    target: pd.Series,
    dataset_metadata: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Cross-validate on training data, fit once, and evaluate the untouched holdout."""
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.20,
        random_state=SEED,
        stratify=target,
    )
    class_labels = sorted(TARGET_LABELS)
    train_counts = y_train.value_counts()
    too_small = train_counts[train_counts < CV_FOLDS]
    if not too_small.empty:
        raise PipelineError(
            f"Training split cannot support stratified {CV_FOLDS}-fold CV; "
            f"training class counts: {train_counts.sort_index().to_dict()}"
        )

    splitter = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=SEED)
    # Explicitly validate every fold contains every class.
    for fold_index, (fold_train, fold_valid) in enumerate(splitter.split(x_train, y_train), start=1):
        train_fold_classes = set(y_train.iloc[fold_train])
        valid_fold_classes = set(y_train.iloc[fold_valid])
        if train_fold_classes != set(class_labels) or valid_fold_classes != set(class_labels):
            raise PipelineError(
                f"Stratified CV fold {fold_index} does not contain all target classes "
                "in both training and validation partitions."
            )

    scorers = {
        "accuracy": "accuracy",
        "balanced_accuracy": "balanced_accuracy",
        "macro_precision": make_scorer(precision_score, average="macro", zero_division=0),
        "macro_recall": make_scorer(recall_score, average="macro", zero_division=0),
        "macro_f1": make_scorer(f1_score, average="macro", zero_division=0),
    }
    model_results: dict[str, Any] = {}
    fitted_models: dict[str, Any] = {}

    for name, estimator in build_models().items():
        try:
            cv_output = cross_validate(
                clone(estimator),
                x_train,
                y_train,
                cv=splitter,
                scoring=scorers,
                return_train_score=False,
                error_score="raise",
                n_jobs=1,
            )
            train_started = time.perf_counter()
            fitted = clone(estimator).fit(x_train, y_train)
            training_seconds = time.perf_counter() - train_started

            prediction_started = time.perf_counter()
            predictions = fitted.predict(x_test)
            prediction_seconds = time.perf_counter() - prediction_started

            report = classification_report(
                y_test,
                predictions,
                labels=class_labels,
                output_dict=True,
                zero_division=0,
            )
            matrix = confusion_matrix(y_test, predictions, labels=class_labels)
            cv_scores = {
                metric: {
                    "fold_scores": [float(v) for v in cv_output[f"test_{metric}"].tolist()],
                    "mean": float(np.mean(cv_output[f"test_{metric}"])),
                    "std": float(np.std(cv_output[f"test_{metric}"])),
                }
                for metric in scorers
            }
            model_results[name] = {
                "python_class": f"{type(fitted).__module__}.{type(fitted).__name__}",
                "model_parameters": json_safe(fitted.get_params(deep=True)),
                "training_seconds": float(training_seconds),
                "prediction_seconds": float(prediction_seconds),
                "holdout_metrics": {
                    "accuracy": float(accuracy_score(y_test, predictions)),
                    "balanced_accuracy": float(balanced_accuracy_score(y_test, predictions)),
                    "macro_precision": float(
                        precision_score(y_test, predictions, average="macro", zero_division=0)
                    ),
                    "macro_recall": float(
                        recall_score(y_test, predictions, average="macro", zero_division=0)
                    ),
                    "macro_f1": float(f1_score(y_test, predictions, average="macro", zero_division=0)),
                },
                "cross_validation_on_training_partition": cv_scores,
                "classification_report": json_safe(report),
                "confusion_matrix": {
                    "labels": class_labels,
                    "matrix": matrix.tolist(),
                },
            }
            fitted_models[name] = fitted
        except Exception as exc:
            raise PipelineError(f"Training/evaluation failed for {name}: {exc}") from exc

    results = {
        "metadata": {
            **dataset_metadata,
            "random_seed": SEED,
            "train_test_split": "stratified 80/20; random_state=42",
            "cross_validation": (
                "StratifiedKFold(n_splits=5, shuffle=True, random_state=42) on training "
                "partition only; descriptive scores do not prove generalization."
            ),
            "training_sample_count": int(len(x_train)),
            "testing_sample_count": int(len(x_test)),
            "training_class_distribution": class_distribution(y_train),
            "testing_class_distribution": class_distribution(y_test),
            "python_version": sys.version.split()[0],
            "scikit_learn_version": sklearn.__version__,
            "evaluation_timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "model_selection_note": (
                "No hyperparameter tuning was performed. The holdout test set was not used "
                "for tuning or model selection."
            ),
            "validation_note": (
                "Predictions are benchmark dataset classifications, not laboratory-validated "
                "results; no independent laboratory reference set is used here."
            ),
        },
        "models": model_results,
    }
    split_metadata = {
        "labels": class_labels,
        "y_test": y_test,
    }
    return results, {**fitted_models, "_split": split_metadata}


def write_outputs(results: dict[str, Any], fitted: dict[str, Any]) -> None:
    """Create reports and candidate artifacts without overwriting existing files."""
    paths = output_paths()
    collisions = [str(path) for path in paths.values() if path.exists()]
    if collisions:
        raise PipelineError(
            "Refusing to overwrite existing output file(s):\n  " + "\n  ".join(collisions)
        )
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Exclusive creation ensures a concurrent run cannot silently replace a file.
    with paths["model_comparison_json"].open("x", encoding="utf-8") as handle:
        json.dump(json_safe(results), handle, indent=2, allow_nan=False)
        handle.write("\n")

    comparison_rows = []
    for name, model_data in results["models"].items():
        comparison_rows.append(
            {
                "model": name,
                "python_class": model_data["python_class"],
                **model_data["holdout_metrics"],
                "training_seconds": model_data["training_seconds"],
                "prediction_seconds": model_data["prediction_seconds"],
                "cv_accuracy_mean": model_data["cross_validation_on_training_partition"]["accuracy"]["mean"],
                "cv_accuracy_std": model_data["cross_validation_on_training_partition"]["accuracy"]["std"],
                "cv_macro_f1_mean": model_data["cross_validation_on_training_partition"]["macro_f1"]["mean"],
                "cv_macro_f1_std": model_data["cross_validation_on_training_partition"]["macro_f1"]["std"],
            }
        )
    pd.DataFrame(comparison_rows).to_csv(paths["model_comparison_csv"], index=False)

    labels = fitted["_split"]["labels"]
    y_test = fitted["_split"]["y_test"]
    name_to_prefix = {
        "random_forest": "random_forest",
        "gaussian_nb": "gaussian_nb",
        "svm": "svm",
    }
    for name, estimator in ((k, v) for k, v in fitted.items() if not k.startswith("_")):
        prefix = name_to_prefix[name]
        # Predictions were computed during evaluation and are recorded there;
        # reconstructing them here would repeat prediction timing unnecessarily.
        matrix = results["models"][name]["confusion_matrix"]["matrix"]
        pd.DataFrame(matrix, index=labels, columns=labels).rename_axis("actual\\predicted").to_csv(
            paths[f"{prefix}_confusion"]
        )
        with paths[f"{prefix}_classification"].open("x", encoding="utf-8") as handle:
            json.dump(
                results["models"][name]["classification_report"],
                handle,
                indent=2,
                allow_nan=False,
            )
            handle.write("\n")
        joblib.dump(estimator, paths[f"{prefix}_candidate"])


def main() -> int:
    """Run the complete pipeline and print concise results and output paths."""
    outputs = output_paths()
    existing = [str(path) for path in outputs.values() if path.exists()]
    if existing:
        print("Refusing to overwrite existing output file(s):", file=sys.stderr)
        print("\n".join(f"  {path}" for path in existing), file=sys.stderr)
        return 2

    try:
        features, target, dataset_metadata = load_and_validate_dataset(DATASET_PATH)
        results, fitted = evaluate_models(features, target, dataset_metadata)
        write_outputs(results, fitted)
    except PipelineError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # Keep failures actionable while preserving traceback context.
        print(f"ERROR: Unexpected pipeline failure: {exc}", file=sys.stderr)
        return 1

    metadata = results["metadata"]
    print(f"Dataset: {DATASET_PATH}")
    print(
        "Rows: "
        f"{metadata['original_sample_count']} original, "
        f"{metadata['duplicate_rows_removed']} exact duplicates removed, "
        f"{metadata['deduplicated_sample_count']} unique remaining"
    )
    print(f"Class distribution (deduplicated): {metadata['deduplicated_class_distribution']}")
    print(
        f"Split: {metadata['training_sample_count']} train / "
        f"{metadata['testing_sample_count']} test; stratified, seed={SEED}"
    )
    print(metadata["small_unique_dataset_notice"])
    print("\nHoldout results (one shared split):")
    for name, details in results["models"].items():
        metrics = details["holdout_metrics"]
        print(
            f"  {name} ({details['python_class']}): "
            f"accuracy={metrics['accuracy']:.4f}, "
            f"balanced_accuracy={metrics['balanced_accuracy']:.4f}, "
            f"macro_precision={metrics['macro_precision']:.4f}, "
            f"macro_recall={metrics['macro_recall']:.4f}, "
            f"macro_f1={metrics['macro_f1']:.4f}, "
            f"train={details['training_seconds']:.4f}s, "
            f"predict={details['prediction_seconds']:.6f}s"
        )
        cv_accuracy = details["cross_validation_on_training_partition"]["accuracy"]
        print(
            f"    Training-partition 5-fold CV accuracy: "
            f"{cv_accuracy['fold_scores']} (mean={cv_accuracy['mean']:.4f}, "
            f"std={cv_accuracy['std']:.4f})"
        )
    print("\nGenerated files:")
    for path in outputs.values():
        print(f"  {path.relative_to(ROOT)}")
    print("\nEvaluation complete. Cross-validation scores are descriptive and do not prove generalization.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
