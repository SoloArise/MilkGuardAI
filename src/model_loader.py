"""
MilkGuard AI - Model Loader Module
Provides thread-safe singleton loading of the trained scikit-learn model artifact.
"""

import os
import warnings
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib

from config.settings import (
    PRIMARY_MODEL_PATH,
    MODEL_PKL_PATH,
    MODEL_JOBLIB_PATH,
    MODEL_FEATURE_COLUMNS,
    TARGET_CLASSES,
    BASE_DIR,
)

# Suppress sklearn unpickling version warnings cleanly
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")


class ModelLoader:
    """Singleton model manager for loading and caching the Milk Quality ML Model."""
    _instance: Optional["ModelLoader"] = None
    _model_artifact: Optional[Dict[str, Any]] = None
    _model = None
    _feature_columns: Optional[List[str]] = None
    _classes: Optional[List[str]] = None
    _sklearn_version: Optional[str] = None
    _loaded_path: Optional[Path] = None
    _load_error: Optional[str] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _resolve_model_path(self) -> Path:
        """Finds the model artifact, prioritizing the primary external path."""
        candidates = [
            PRIMARY_MODEL_PATH,
            BASE_DIR.parent / "Models" / "milk_quality_model.pkl",
            MODEL_PKL_PATH,
            MODEL_JOBLIB_PATH,
            BASE_DIR / "models" / "milk_quality_model.pkl",
        ]
        for p in candidates:
            if p.exists() and p.is_file():
                return p
        raise FileNotFoundError(
            f"Trained model artifact not found. Checked locations:\n" +
            "\n".join(f" - {p}" for p in candidates)
        )

    def _load_model(self):
        """Loads and verifies the model artifact structure."""
        try:
            model_path = self._resolve_model_path()
            self._loaded_path = model_path
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                artifact = joblib.load(model_path)

            if isinstance(artifact, dict):
                self._model_artifact = artifact
                self._model = artifact.get("model")
                self._feature_columns = artifact.get("feature_columns", MODEL_FEATURE_COLUMNS)
                self._classes = artifact.get("classes", TARGET_CLASSES)
                self._sklearn_version = artifact.get("sklearn_version", "unknown")
            else:
                # Direct classifier object
                self._model = artifact
                self._feature_columns = getattr(
                    artifact, "feature_names_in_", MODEL_FEATURE_COLUMNS
                )
                self._classes = getattr(artifact, "classes_", TARGET_CLASSES)
                self._sklearn_version = "unknown"
                self._model_artifact = {
                    "model": self._model,
                    "feature_columns": self._feature_columns,
                    "classes": self._classes,
                    "sklearn_version": self._sklearn_version,
                }

            if self._model is None or not hasattr(self._model, "predict"):
                raise ValueError("Loaded artifact does not contain a valid scikit-learn predictor.")

            self._load_error = None
        except Exception as ex:
            self._model = None
            self._model_artifact = None
            self._load_error = str(ex)

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def error(self) -> Optional[str]:
        return self._load_error

    @property
    def model(self):
        if not self.is_loaded:
            raise RuntimeError(f"Model is not loaded. Error: {self._load_error}")
        return self._model

    @property
    def feature_columns(self) -> List[str]:
        return list(self._feature_columns or MODEL_FEATURE_COLUMNS)

    @property
    def classes(self) -> List[str]:
        return list(self._classes or TARGET_CLASSES)

    @property
    def sklearn_version(self) -> str:
        return self._sklearn_version or "unknown"

    @property
    def loaded_path(self) -> Optional[str]:
        return str(self._loaded_path) if self._loaded_path else None

    def get_metadata(self) -> Dict[str, Any]:
        """Returns descriptive metadata about the loaded model."""
        if not self.is_loaded:
            return {"status": "error", "error": self._load_error}
            
        params = getattr(self._model, "get_params", lambda: {})()
        feature_importances = {}
        if hasattr(self._model, "feature_importances_"):
            for col, imp in zip(self.feature_columns, self._model.feature_importances_):
                feature_importances[col] = round(float(imp), 4)

        return {
            "status": "loaded",
            "model_path": str(self._loaded_path),
            "algorithm": type(self._model).__name__,
            "n_estimators": params.get("n_estimators", 200),
            "random_state": params.get("random_state", 42),
            "feature_columns": self.feature_columns,
            "classes": [str(c) for c in self.classes],
            "feature_importances": feature_importances,
            "sklearn_version": self.sklearn_version,
        }


def get_model_loader() -> ModelLoader:
    """Helper function to obtain the ModelLoader singleton."""
    return ModelLoader()

