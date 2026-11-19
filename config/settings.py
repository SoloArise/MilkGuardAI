"""
MilkGuard AI - Configuration and Settings
Centralized paths, feature definitions, validation boundaries, and styling metadata.
"""

from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATABASE_DIR = BASE_DIR / "database"
ASSETS_DIR = BASE_DIR / "assets"
REPORTS_DIR = BASE_DIR / "reports"

# Ensure all directories exist
for directory in [DATA_DIR, MODELS_DIR, DATABASE_DIR, ASSETS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# File Paths
DATASET_PATH = DATA_DIR / "milk_quality_dataset.csv"

# Primary Trained Model Path (Explicitly located in parent Models directory)
PRIMARY_MODEL_PATH = Path(r"F:\Harsh\Erudite\Graphic Era\Semester 3\Mini Project\Models\milk_quality_model.pkl")
MODEL_PKL_PATH = PRIMARY_MODEL_PATH if PRIMARY_MODEL_PATH.exists() else (MODELS_DIR / "milk_quality_model.pkl")
MODEL_JOBLIB_PATH = MODELS_DIR / "milk_quality_model.joblib"
DB_PATH = DATABASE_DIR / "history.db"

# Brand Information
APP_NAME = "MilkGuard AI"
APP_SUBTITLE = "Intelligent Milk Quality Analysis System"
ORGANIZATION = "Green Valley Dairy"
MODEL_VERSION = "v2.4.1"
MODEL_ALGORITHM = "Random Forest Classifier"

# Exact Feature Columns expected by the trained ML model (notice specific spellings)
MODEL_FEATURE_COLUMNS = [
    "pH",
    "Temprature",
    "Taste",
    "Odor",
    "Fat",
    "Turbidity",
    "Colour",
]

# Display Feature Mapping (for user-facing UI)
FEATURE_DISPLAY_NAMES = {
    "pH": "pH Level",
    "Temprature": "Temperature (°C)",
    "Taste": "Taste Assessment",
    "Odor": "Odor Assessment",
    "Fat": "Fat Content",
    "Turbidity": "Turbidity / Clarity",
    "Colour": "Color Value (RGB)",
}

# Target Output Classes
CLASS_HIGH = "high"
CLASS_MEDIUM = "medium"
CLASS_LOW = "low"

TARGET_CLASSES = [CLASS_HIGH, CLASS_MEDIUM, CLASS_LOW]

CLASS_DISPLAY_LABELS = {
    CLASS_HIGH: "High Quality",
    CLASS_MEDIUM: "Medium Quality",
    CLASS_LOW: "Low Quality",
}

# Color Theme Palette
THEME = {
    "primary": "#216B45",        # Forest green
    "primary_dark": "#154E31",   # Dark forest green
    "secondary": "#E8F5EC",      # Mint green
    "background": "#F8FAF8",     # Off-white app background
    "card_bg": "#FFFFFF",        # Pure white card
    "accent": "#A5D6A7",         # Lime / sage accent
    "text_main": "#26332B",      # Dark charcoal text
    "text_muted": "#6E7C73",     # Muted gray-green
    "border": "#E4EAE6",         # Subtle border
    "warning": "#D98B24",        # Amber
    "warning_bg": "#FFF3DC",
    "danger": "#BB5A55",         # Red
    "danger_bg": "#FAECEB",
}

# Feature Validation Rules
VALIDATION_RULES = {
    "pH": {
        "min": 0.0,
        "max": 14.0,
        "dataset_min": 3.0,
        "dataset_max": 9.5,
        "typical_optimal_min": 6.5,
        "typical_optimal_max": 6.8,
        "default": 6.6,
        "step": 0.1,
        "unit": "pH",
        "description": "Acidity or alkalinity measure (pure milk is typically 6.5 - 6.8)",
    },
    "Temprature": {
        "min": 0.0,
        "max": 100.0,
        "dataset_min": 34.0,
        "dataset_max": 90.0,
        "typical_optimal_min": 34.0,
        "typical_optimal_max": 40.0,
        "default": 37.0,
        "step": 0.5,
        "unit": "°C",
        "description": "Sample temperature in Celsius during inspection",
    },
    "Taste": {
        "type": "binary",
        "options": {1: "Acceptable / Optimal", 0: "Unacceptable / Substandard"},
        "default": 1,
        "description": "Sensory evaluation of milk taste",
    },
    "Odor": {
        "type": "binary",
        "options": {1: "Normal / Fresh", 0: "Abnormal / Sour"},
        "default": 1,
        "description": "Sensory evaluation of milk odor",
    },
    "Fat": {
        "type": "binary",
        "options": {1: "Present / Optimal", 0: "Absent / Deficient"},
        "default": 1,
        "description": "Fat content presence according to standard dairy benchmarks",
    },
    "Turbidity": {
        "type": "binary",
        "options": {0: "Clear / Optimal", 1: "Turbid / Elevated Impurity"},
        "default": 0,
        "description": "Light scattering clarity / cloudiness measurement",
    },
    "Colour": {
        "min": 0,
        "max": 255,
        "dataset_min": 240,
        "dataset_max": 255,
        "typical_optimal_min": 245,
        "typical_optimal_max": 255,
        "default": 254,
        "step": 1,
        "unit": "RGB",
        "description": "Color whiteness intensity on an 8-bit photometric scale (0-255)",
    },
}

DISCLAIMER_TEXT = (
    "MilkGuard AI is an automated machine-learning decision support system designed "
    "to assist quality screening in dairy farms and collection hubs. Predictions are "
    "based on statistical models and physical parameters; they do not constitute a "
    "legal laboratory certification or food safety warranty."
)

