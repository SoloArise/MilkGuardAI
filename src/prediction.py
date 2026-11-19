"""
MilkGuard AI - Prediction & Inference Engine
Orchestrates validation, preprocessing, model execution, probability scoring, and database logging.
"""

import random
from datetime import datetime
from typing import Dict, Any, Optional

from config.settings import (
    CLASS_DISPLAY_LABELS,
    CLASS_HIGH,
    CLASS_MEDIUM,
    CLASS_LOW,
    DISCLAIMER_TEXT,
    MODEL_VERSION,
)
from src.validation import validate_sample_inputs, ValidationError
from src.preprocessing import prepare_features_for_inference
from src.model_loader import get_model_loader
from src.database import insert_prediction, get_connection


def generate_sample_id() -> str:
    """Generates an incremental unique Sample ID such as MG-2842 based on maximum stored integer."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT MAX(CAST(SUBSTR(sample_id, 4) AS INTEGER)) 
                FROM predictions 
                WHERE sample_id LIKE 'MG-%';
            """)
            row = cursor.fetchone()
            if row and row[0] is not None:
                max_num = int(row[0])
                return f"MG-{max_num + 1}"
    except Exception:
        pass
    return f"MG-{random.randint(2900, 9999)}"


def predict_milk_sample(
    raw_inputs: Dict[str, Any],
    save_to_db: bool = True,
    sample_id: Optional[str] = None,
    inspector_name: str = "Alex Morgan",
    inspector_notes: str = ""
) -> Dict[str, Any]:
    """
    Executes end-to-end prediction for a single milk sample.
    
    Args:
        raw_inputs: Raw parameter dictionary.
        save_to_db: Whether to commit the prediction to SQLite.
        sample_id: Optional explicit sample ID; auto-generated if omitted.
        inspector_name: Name of the active user/inspector.
        inspector_notes: Optional remarks.
        
    Returns:
        Structured prediction outcome dictionary.
    """
    # 1. Validation
    is_valid, errors, clean_inputs = validate_sample_inputs(raw_inputs)
    if not is_valid:
        raise ValidationError("Input validation failed.", errors=errors)

    # 2. Model Loading
    loader = get_model_loader()
    if not loader.is_loaded:
        raise RuntimeError(f"Model failed to load: {loader.error}")

    model = loader.model

    # 3. Preprocessing
    feature_df = prepare_features_for_inference(clean_inputs, loader.feature_columns)

    # 4. Model Prediction
    raw_pred = model.predict(feature_df)[0]
    pred_str = str(raw_pred).lower().strip()

    # 5. Probabilities & Confidence
    proba_dict = {CLASS_HIGH: 0.0, CLASS_MEDIUM: 0.0, CLASS_LOW: 0.0}
    confidence_pct = 95.0

    if hasattr(model, "predict_proba"):
        probas = model.predict_proba(feature_df)[0]
        for cls_name, prob in zip(model.classes_, probas):
            cls_key = str(cls_name).lower().strip()
            proba_dict[cls_key] = round(float(prob), 4)

        if pred_str in proba_dict:
            confidence_pct = round(proba_dict[pred_str] * 100, 1)

    # 6. Formatting & Visual Metadata
    label = CLASS_DISPLAY_LABELS.get(pred_str, pred_str.capitalize() + " Quality")
    
    if pred_str == CLASS_HIGH:
        theme_status = "success"
        color_hex = "#216B45"
        recommendation = "Approved for premium Grade-A dairy distribution and direct retail packaging."
    elif pred_str == CLASS_MEDIUM:
        theme_status = "warning"
        color_hex = "#D98B24"
        recommendation = "Acceptable for secondary processing (cheese, yogurt, or pasteurized blending). Monitor storage temp."
    else:
        theme_status = "danger"
        color_hex = "#BB5A55"
        recommendation = "Substandard / rejected batch. Does not meet food safety standards; discard or quarantine."

    sid = sample_id or generate_sample_id()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    result = {
        "sample_id": sid,
        "created_at": now_str,
        "predicted_quality": pred_str,
        "predicted_label": label,
        "confidence": confidence_pct,
        "status": theme_status,
        "color_hex": color_hex,
        "recommendation": recommendation,
        "probabilities": proba_dict,
        "parameters": {
            "pH": clean_inputs["pH"],
            "temperature": clean_inputs["Temprature"],
            "taste": clean_inputs["Taste"],
            "odor": clean_inputs["Odor"],
            "fat": clean_inputs["Fat"],
            "turbidity": clean_inputs["Turbidity"],
            "color": clean_inputs["Colour"],
        },
        "model_version": MODEL_VERSION,
        "inspector_name": inspector_name,
        "disclaimer": DISCLAIMER_TEXT,
    }

    # 7. Persistence
    if save_to_db:
        record_to_insert = {
            "sample_id": sid,
            "created_at": now_str,
            "ph": clean_inputs["pH"],
            "temperature": clean_inputs["Temprature"],
            "taste": clean_inputs["Taste"],
            "odor": clean_inputs["Odor"],
            "fat": clean_inputs["Fat"],
            "turbidity": clean_inputs["Turbidity"],
            "color": clean_inputs["Colour"],
            "predicted_quality": pred_str,
            "predicted_label": label,
            "confidence": confidence_pct,
            "proba_high": proba_dict.get(CLASS_HIGH, 0.0),
            "proba_medium": proba_dict.get(CLASS_MEDIUM, 0.0),
            "proba_low": proba_dict.get(CLASS_LOW, 0.0),
            "model_version": MODEL_VERSION,
            "inspector_name": inspector_name,
            "inspector_notes": inspector_notes,
        }
        insert_prediction(record_to_insert)

    return result
