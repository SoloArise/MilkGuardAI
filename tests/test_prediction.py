"""
Tests for Prediction Engine and Preprocessing
"""

import pytest
from src.prediction import predict_milk_sample
from src.validation import validate_sample_inputs, ValidationError


def test_input_validation_valid():
    valid_inputs = {
        "pH": 6.7,
        "temperature": 37.0,
        "taste": "Acceptable",
        "odor": "Normal",
        "fat": "Present",
        "turbidity": "Clear",
        "color": 255,
    }
    is_valid, errors, clean = validate_sample_inputs(valid_inputs)
    assert is_valid is True
    assert len(errors) == 0
    assert clean["pH"] == 6.7
    assert clean["Temprature"] == 37.0
    assert clean["Taste"] == 1
    assert clean["Odor"] == 1
    assert clean["Fat"] == 1
    assert clean["Turbidity"] == 0
    assert clean["Colour"] == 255


def test_input_validation_invalid_range():
    invalid_inputs = {
        "pH": 19.5,  # Out of range 0-14
        "temperature": 150.0,  # Out of range
        "taste": 1,
        "odor": 1,
        "fat": 1,
        "turbidity": 0,
        "color": 300,  # Out of range 0-255
    }
    is_valid, errors, clean = validate_sample_inputs(invalid_inputs)
    assert is_valid is False
    assert "pH" in errors
    assert "Temprature" in errors
    assert "Colour" in errors


def test_prediction_high_quality():
    inputs = {
        "pH": 6.6,
        "temperature": 35.0,
        "taste": 1,
        "odor": 0,
        "fat": 1,
        "turbidity": 0,
        "color": 254,
    }
    result = predict_milk_sample(inputs, save_to_db=False)
    assert result["predicted_quality"] == "high"
    assert result["confidence"] > 50.0
    assert "probabilities" in result
    assert result["status"] == "success"


def test_prediction_low_quality():
    inputs = {
        "pH": 3.0,
        "temperature": 70.0,
        "taste": 0,
        "odor": 1,
        "fat": 0,
        "turbidity": 1,
        "color": 240,
    }
    result = predict_milk_sample(inputs, save_to_db=False)
    assert result["predicted_quality"] == "low"
    assert result["status"] == "danger"

