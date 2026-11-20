"""
Tests for FastAPI Backend Router Functions
"""

import pytest
from api.server import (
    get_system_status,
    get_stats,
    predict_sample,
    list_predictions,
    get_prediction,
    clear_all_history,
    get_trends,
    get_parameter_comparison,
    get_dataset_info,
    get_training_eval,
    SampleInputRequest,
    seed_demo_data_if_needed,
)


def test_api_status():
    status = get_system_status()
    assert status["is_model_loaded"] is True
    assert status["app_name"] == "MilkGuard AI"
    assert "metadata" in status


def test_api_statistics():
    stats = get_stats()
    assert stats["total_samples"] > 0
    assert "pass_rate" in stats


def test_api_predict():
    payload = SampleInputRequest(
        pH=6.6,
        temperature=35.0,
        taste=1,
        odor=0,
        fat=1,
        turbidity=0,
        color=254,
        inspector_notes="API router test",
    )
    res = predict_sample(payload)
    assert res["predicted_quality"] == "high"
    assert res["confidence"] > 50.0
    assert "sample_id" in res


def test_api_list_and_details():
    records = list_predictions(limit=5)
    assert len(records) > 0
    first_id = records[0]["sample_id"]

    details = get_prediction(first_id)
    assert details["sample_id"] == first_id


def test_api_analytics():
    trends = get_trends()
    assert "high_quality_rates" in trends or "high_rates" in trends

    params = get_parameter_comparison()
    assert "ph" in params
    assert "temperature" in params

    dataset_info = get_dataset_info()
    assert dataset_info["status"] == "available"
    assert dataset_info["total_samples"] == 1059

    training_eval = get_training_eval()
    assert training_eval["dataset"]["total_raw_records"] == 1059
    assert training_eval["dataset"]["duplicate_records_removed"] == 976
    assert training_eval["dataset"]["unique_records"] == 83
    assert training_eval["split"]["train_samples"] == 66
    assert training_eval["split"]["test_samples"] == 17
    assert training_eval["model"]["algorithm"] == "Gaussian Naive Bayes"
    assert training_eval["holdout_test"]["correct_predictions"] == 14
    assert training_eval["holdout_test"]["incorrect_predictions"] == 3
    assert training_eval["holdout_test"]["test_accuracy"] == 82.35
    assert training_eval["cross_validation"]["mean_accuracy"] == 85.59
    assert training_eval["cross_validation"]["mean_macro_f1"] == 0.8518


def test_api_clear_all_predictions():
    res = clear_all_history()
    assert res["status"] == "cleared"
    assert "deleted_count" in res

    # Re-seed demo data for ongoing testing & demonstration
    seed_demo_data_if_needed(force=True)
    stats = get_stats()
    assert stats["total_samples"] > 0


