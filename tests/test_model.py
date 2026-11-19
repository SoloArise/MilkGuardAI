"""
Tests for Model Loading and Artifact Integrity
"""

import pytest
import pandas as pd
from src.model_loader import get_model_loader
from config.settings import MODEL_FEATURE_COLUMNS, TARGET_CLASSES


def test_model_loading_and_singleton():
    loader = get_model_loader()
    assert loader.is_loaded is True, f"Model failed to load: {loader.error}"
    assert loader.model is not None


def test_model_feature_columns():
    loader = get_model_loader()
    assert loader.feature_columns == MODEL_FEATURE_COLUMNS


def test_model_classes():
    loader = get_model_loader()
    classes = [str(c).lower().strip() for c in loader.classes]
    for target in TARGET_CLASSES:
        assert target in classes


def test_model_prediction_and_proba():
    loader = get_model_loader()
    model = loader.model

    # Sample input DataFrame matching schema
    sample = pd.DataFrame([{
        "pH": 6.6,
        "Temprature": 35.0,
        "Taste": 1,
        "Odor": 0,
        "Fat": 1,
        "Turbidity": 0,
        "Colour": 254,
    }])

    pred = model.predict(sample)
    assert len(pred) == 1
    assert str(pred[0]).lower().strip() in TARGET_CLASSES

    proba = model.predict_proba(sample)
    assert proba.shape == (1, 3)
    assert abs(proba.sum() - 1.0) < 1e-4

