"""
Tests for SQLite Database CRUD and Statistics
"""

import pytest
from src.database import (
    init_db,
    insert_prediction,
    get_all_predictions,
    get_prediction_by_id,
    delete_prediction,
    clear_all_predictions,
    get_statistics,
    seed_demo_data_if_needed,
)


def test_database_lifecycle():
    init_db()

    # Insert test record
    test_id = "MG-TEST-999"
    delete_prediction(test_id)  # Clean up before

    record = {
        "sample_id": test_id,
        "ph": 6.7,
        "temperature": 36.5,
        "taste": 1,
        "odor": 1,
        "fat": 1,
        "turbidity": 0,
        "color": 254,
        "predicted_quality": "high",
        "predicted_label": "High Quality",
        "confidence": 97.5,
        "proba_high": 0.975,
        "proba_medium": 0.025,
        "proba_low": 0.0,
        "inspector_name": "Test Inspector",
        "inspector_notes": "Unit test sample record.",
    }
    inserted = insert_prediction(record)
    assert inserted["sample_id"] == test_id

    # Retrieve by ID
    fetched = get_prediction_by_id(test_id)
    assert fetched is not None
    assert fetched["ph"] == 6.7
    assert fetched["predicted_quality"] == "high"

    # Fetch with filter
    df = get_all_predictions(quality_filter="high", search_query="MG-TEST-999")
    assert not df.empty
    assert df.iloc[0]["sample_id"] == test_id

    # Statistics check
    stats = get_statistics()
    assert stats["total_samples"] > 0
    assert stats["high_count"] >= 1

    # Delete
    deleted = delete_prediction(test_id)
    assert deleted is True

    # Verify gone
    assert get_prediction_by_id(test_id) is None


def test_database_clear_all():
    init_db()
    # Insert a temporary test record
    insert_prediction({
        "sample_id": "MG-CLEAR-TEST",
        "ph": 6.5,
        "temperature": 37.0,
        "taste": 1,
        "odor": 1,
        "fat": 1,
        "turbidity": 0,
        "color": 250,
        "predicted_quality": "high",
        "predicted_label": "High Quality",
        "confidence": 95.0,
    })
    
    # Clear all records
    deleted_count = clear_all_predictions()
    assert deleted_count >= 1
    
    # Verify table is now empty
    stats = get_statistics()
    assert stats["total_samples"] == 0

    # Re-seed demo data so other components have benchmark data
    seed_demo_data_if_needed(force=True)
    post_stats = get_statistics()
    assert post_stats["total_samples"] > 0


