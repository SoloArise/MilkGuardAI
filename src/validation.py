"""
MilkGuard AI - Input Validation Module
Validates raw user inputs, verifies bounds, and prevents malformed data from reaching the model.
"""

from typing import Dict, Any, Tuple, List
from config.settings import VALIDATION_RULES, MODEL_FEATURE_COLUMNS


class ValidationError(Exception):
    """Custom exception raised when input validation fails."""
    def __init__(self, message: str, errors: Dict[str, str] = None):
        super().__init__(message)
        self.errors = errors or {}


def validate_sample_inputs(inputs: Dict[str, Any]) -> Tuple[bool, Dict[str, str], Dict[str, Any]]:
    """
    Validates a dictionary of raw input parameters against domain and model constraints.
    
    Args:
        inputs: Dictionary containing feature values.
                Keys may be model feature names ('pH', 'Temprature', 'Taste', etc.)
                or case-insensitive variants ('temperature', 'color', etc.)
                
    Returns:
        Tuple of (is_valid: bool, errors: Dict[str, str], clean_inputs: Dict[str, Any])
    """
    errors: Dict[str, str] = {}
    clean: Dict[str, Any] = {}
    
    # Normalize input keys
    normalized_keys = {
        "ph": "pH",
        "temperature": "Temprature",
        "temprature": "Temprature",
        "temp": "Temprature",
        "taste": "Taste",
        "odor": "Odor",
        "fat": "Fat",
        "turbidity": "Turbidity",
        "colour": "Colour",
        "color": "Colour",
    }
    
    raw_mapped = {}
    for k, v in inputs.items():
        clean_k = normalized_keys.get(k.lower(), k)
        raw_mapped[clean_k] = v

    for feature in MODEL_FEATURE_COLUMNS:
        rule = VALIDATION_RULES.get(feature)
        if not rule:
            continue
            
        val = raw_mapped.get(feature)
        if val is None or val == "":
            errors[feature] = f"Field '{feature}' is required."
            continue
            
        # Binary categorical validation
        if rule.get("type") == "binary":
            try:
                # Handle string inputs like "Acceptable", "Present", "Clear", "Normal", "1", "0"
                if isinstance(val, str):
                    v_lower = val.strip().lower()
                    if v_lower in ["1", "true", "yes", "acceptable", "normal", "present", "turbid", "high"]:
                        # Turbidity: 1 is turbid
                        int_val = 1
                    elif v_lower in ["0", "false", "no", "unacceptable", "abnormal", "absent", "clear", "low"]:
                        int_val = 0
                    else:
                        int_val = int(val)
                elif isinstance(val, (bool, int, float)):
                    int_val = int(val)
                else:
                    errors[feature] = f"{feature} must be 0 or 1."
                    continue
                    
                if int_val not in (0, 1):
                    errors[feature] = f"{feature} must be either 0 or 1."
                else:
                    clean[feature] = int_val
            except (ValueError, TypeError):
                errors[feature] = f"Invalid binary value for {feature}."
                
        # Numeric continuous / discrete validation
        else:
            try:
                num_val = float(val)
                min_v = rule.get("min", float("-inf"))
                max_v = rule.get("max", float("inf"))
                
                if num_val < min_v or num_val > max_v:
                    errors[feature] = (
                        f"{feature} must be between {min_v} and {max_v} "
                        f"(dataset range is {rule.get('dataset_min')}-{rule.get('dataset_max')})."
                    )
                else:
                    # Colour is typically integer
                    if feature == "Colour":
                        clean[feature] = int(round(num_val))
                    else:
                        clean[feature] = float(num_val)
            except (ValueError, TypeError):
                errors[feature] = f"Invalid numeric value for {feature}."

    is_valid = len(errors) == 0
    return is_valid, errors, clean

