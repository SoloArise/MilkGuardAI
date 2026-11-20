"""
Tests for FastAPI Backend Router Functions
"""

import pytest
from fastapi import HTTPException
import src.analytics as analytics
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
    assert training_eval["metadata"]["dataset_sha256"]
    assert training_eval["metadata"]["evaluation_timestamp_utc"]
    assert set(training_eval["models"]) == {"random_forest", "gaussian_nb", "svm"}
    for model_result in training_eval["models"].values():
        assert set(model_result["holdout_metrics"]) == {
            "accuracy",
            "balanced_accuracy",
            "macro_precision",
            "macro_recall",
            "macro_f1",
        }
        assert len(model_result["confusion_matrix"]["matrix"]) == 3
        assert "macro avg" in model_result["classification_report"]
        assert len(model_result["cross_validation_on_training_partition"]["accuracy"]["fold_scores"]) == 5


def test_training_evaluation_unavailable(monkeypatch, tmp_path):
    monkeypatch.setattr(
        analytics,
        "TRAINING_EVALUATION_REPORT_PATH",
        tmp_path / "missing_model_comparison.json",
    )

    with pytest.raises(HTTPException) as exc_info:
        get_training_eval()

    assert getattr(exc_info.value, "status_code", None) == 503
    assert "unavailable" in str(exc_info.value.detail).lower()


def test_api_clear_all_predictions():
    res = clear_all_history()
    assert res["status"] == "cleared"
    assert "deleted_count" in res

    # Re-seed demo data for ongoing testing & demonstration
    seed_demo_data_if_needed(force=True)
    stats = get_stats()
    assert stats["total_samples"] > 0


