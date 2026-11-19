"""
MilkGuard AI - Preprocessing Module
Transforms user inputs into exact feature matrices matching the trained model's schema.
"""

from typing import Dict, Any, Union, List
import pandas as pd
from config.settings import MODEL_FEATURE_COLUMNS


def prepare_features_for_inference(
    inputs: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame],
    feature_columns: List[str] = None
) -> pd.DataFrame:
    """
    Constructs a DataFrame matching the model's exact feature ordering and types.
    
    Args:
        inputs: Single dictionary of inputs, list of input dictionaries, or DataFrame.
        feature_columns: Expected column ordering (defaults to MODEL_FEATURE_COLUMNS).
        
    Returns:
        pd.DataFrame strictly ordered with columns ['pH', 'Temprature', 'Taste', 'Odor', 'Fat', 'Turbidity', 'Colour'].
    """
    if feature_columns is None:
        feature_columns = MODEL_FEATURE_COLUMNS

    if isinstance(inputs, pd.DataFrame):
        df = inputs.copy()
        # Strip column names if necessary
        df.columns = [c.strip() for c in df.columns]
        # Rename common casing mismatches
        rename_map = {
            "temperature": "Temprature",
            "Temperature": "Temprature",
            "color": "Colour",
            "Color": "Colour",
            "ph": "pH",
            "PH": "pH",
            "fat": "Fat",
            "Fat ": "Fat",
        }
        df = df.rename(columns=rename_map)
    elif isinstance(inputs, list):
        df = pd.DataFrame(inputs)
    elif isinstance(inputs, dict):
        df = pd.DataFrame([inputs])
    else:
        raise TypeError(f"Unsupported inputs type: {type(inputs)}")

    # Ensure all required features are present
    missing = [c for c in feature_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required feature columns for model inference: {missing}")

    # Reorder columns strictly
    df_ordered = df[feature_columns].copy()

    # Enforce precise data types
    df_ordered["pH"] = df_ordered["pH"].astype(float)
    df_ordered["Temprature"] = df_ordered["Temprature"].astype(float)
    df_ordered["Taste"] = df_ordered["Taste"].astype(int)
    df_ordered["Odor"] = df_ordered["Odor"].astype(int)
    df_ordered["Fat"] = df_ordered["Fat"].astype(int)
    df_ordered["Turbidity"] = df_ordered["Turbidity"].astype(int)
    df_ordered["Colour"] = df_ordered["Colour"].astype(int)

    return df_ordered

