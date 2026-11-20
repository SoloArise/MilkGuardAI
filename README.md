# 🥛 MilkGuard AI – Intelligent Milk Quality Analysis and Classification System

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![Scikit-Learn 1.6+](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-orange.svg)](https://scikit-learn.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.40%2B-FF4B4B.svg)](https://streamlit.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19%20%2B%20Vite%20%2B%20Tailwind%20v4-61DAFB.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen.svg)](https://pytest.org/)

An enterprise-grade, machine-learning-powered milk quality screening and grading system designed for dairy collection centers, milk processing plants, quality inspectors, and academic evaluation.

---

## 📌 1. Project Background & Overview

This system is developed as an **MCA (Artificial Intelligence and Data Science)** academic project under the Department of Computer Applications, **Graphic Era (Deemed to be University)**, Dehradun, supervised by **Dr. S.C. Dimri**, authored by **Harsh Verma** (Roll No: 1103713).

Traditional milk testing in rural and semi-urban collection centers relies either on slow chemical laboratory analysis or subjective organoleptic checks (smell, visual clarity, palate), which are prone to delay and human error. **MilkGuard AI** provides automated, rapid classification of raw milk samples into **three quality categories**:
- 🟢 **High Quality (Grade A):** Approved for premium direct retail distribution and packaging.
- 🟡 **Medium Quality (Grade B):** Acceptable for pasteurized blending, yogurt, and cheese manufacturing.
- 🔴 **Low Quality (Rejected):** Substandard / spoiled batch; quarantine or discard.

---

## ⚙️ 2. Integrated Dataset & Trained Model Details

### Actual Dataset
- **Sourcing:** Reference benchmark dairy quality dataset (`data/milk_quality_dataset.csv`, 1,059 samples).
- **Features (7 Input Variables):**
  1. `pH`: Continuous measure of acidity / alkalinity (allowed: 0.0–14.0; optimal: 6.5–6.8).
  2. `Temprature`: Sample temperature in Celsius (allowed: 0.0–100.0°C; normal: 34.0–40.0°C).
  3. `Taste`: Sensory taste evaluation (`1`: Acceptable / Optimal, `0`: Substandard).
  4. `Odor`: Sensory smell evaluation (`1`: Normal / Fresh, `0`: Abnormal / Sour).
  5. `Fat`: Standard fat content presence (`1`: Present / Optimal, `0`: Absent).
  6. `Turbidity`: Light scattering and clarity (`0`: Clear / Optimal, `1`: Turbid / Impurities).
  7. `Colour`: Photometric whiteness measurement (`0–255` RGB scale; benchmark: 240–255).
- **Target Distribution:**
  - `low`: 429 samples (40.5%)
  - `medium`: 374 samples (35.3%)
  - `high`: 256 samples (24.2%)

### Machine Learning Model Architecture
- **Primary Source Artifact:** `F:\Harsh\Erudite\Graphic Era\Semester 3\Mini Project\Models\milk_quality_model.pkl`
- **Fallback Project Mirror:** `models/milk_quality_model.pkl` (and `milk_quality_model.joblib`).
- **Algorithm:** `RandomForestClassifier` (Scikit-Learn).
- **Ensemble Topology:** 200 de-correlated decision trees, balanced class weighting, Gini impurity criterion.
- **Empirically Verified Performance (80/20 Hold-out Split):**
  - **Accuracy:** `99.53%` (100% on full dataset benchmark)
  - **Macro Precision:** `99.0%`
  - **Macro Recall:** `100.0%`
  - **Weighted F1-Score:** `99.5%`
- **Learned Feature Importances:**
  1. `Temprature`: 28.46%
  2. `pH`: 28.06%
  3. `Fat`: 13.40%
  4. `Odor`: 9.02%
  5. `Colour`: 8.40%
  6. `Turbidity`: 6.44%
  7. `Taste`: 6.21%

---

## 🏗️ 3. Project Architecture

```
MilkGuard-AI/
├── app.py                     # Main Streamlit Executive Dashboard
├── config/
│   └── settings.py            # Global configuration, constants, validation boundaries
├── data/
│   └── milk_quality_dataset.csv # Original benchmark 1,059-sample dataset
├── models/
│   ├── milk_quality_model.pkl # Trained Random Forest artifact
│   └── milk_quality_model.joblib # Joblib serialized mirror
├── database/
│   └── history.db             # SQLite WAL-mode prediction registry
├── src/
│   ├── __init__.py
│   ├── model_loader.py        # Thread-safe singleton model loader
│   ├── preprocessing.py       # Strict schema & feature order transformer
│   ├── prediction.py          # Inference engine & probabilistic scoring
│   ├── database.py            # SQLite CRUD & dynamic analytics calculator
│   ├── analytics.py           # Historical trends & parameter benchmarks
│   ├── report_generator.py    # Downloadable CSV & printable HTML certificates
│   ├── validation.py          # Parameter bounds & type sanity validation
│   └── ui_components.py       # Shared B2B SaaS navigation & CSS helpers
├── pages/
│   ├── 1_📊_Dashboard.py      # Multi-metric KPI overview
│   ├── 2_🧪_Milk_Analysis.py  # 7-parameter interactive prediction form
│   ├── 3_🕒_Prediction_History.py # Search, filter, inspect, and delete records
│   ├── 4_📈_Analytics_Reports.py  # 12-week quality trend & parameter comparisons
│   ├── 5_🧠_About_Model.py    # Decision tree topology & verified metrics
│   └── 6_⚙️_Settings.py       # Inspector profile & alert preferences
├── assets/
│   ├── logo.svg               # Vector brand mark
│   └── custom.css             # Forest-green B2B SaaS styling
├── api/
│   └── server.py              # FastAPI REST backend serving predictions & React bundle
├── frontend/                  # High-fidelity React 19 + Vite + Tailwind CSS v4 dashboard
│   ├── src/
│   │   ├── components/        # Sidebar, TopNav, SVG Icons, RecordModal
│   │   ├── pages/             # Dashboard, Analysis, History, Analytics, About, Settings
│   │   ├── App.tsx            # Full-featured client application
│   │   └── types.ts           # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── reports/                   # Export directory for generated CSVs & reports
├── tests/
│   ├── test_model.py          # Model loader & predict_proba test cases
│   ├── test_prediction.py     # Range validation & inference tests
│   ├── test_database.py       # SQLite CRUD & stats tests
│   └── test_api.py            # REST endpoints router tests
├── requirements.txt           # Python package requirements
├── README.md                  # Comprehensive documentation
└── .gitignore
```

---

## 🚀 4. Installation & Execution Guide (Windows)

### Prerequisites
- Python 3.12+ (Python 3.14 compatible)
- Node.js 18+ (for React frontend)

### Step 1: Clone and Set Up Virtual Environment
```powershell
# Navigate to the workspace directory
cd "F:\Harsh\Erudite\Graphic Era\Semester 3\Mini Project\Milk Analysis using ML"

# Create a virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt
```

### Step 2: Run the Streamlit Multi-Page Application (Academic UI)
```powershell
streamlit run app.py
```
*The app will automatically launch in your browser at `http://localhost:8501`.*

### Step 3: Run the FastAPI + React SaaS Production Interface
```powershell
# Run the FastAPI server (serves REST API and compiled React SPA)
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000 --reload
```
*Open `http://localhost:8000` to interact with the high-fidelity React SaaS dashboard.*

### Step 4 (Optional): Run the Vite Frontend in Hot-Reload Development Mode
```powershell
cd frontend
npm run dev
```
*Open `http://localhost:5173`.*

---

## 🧪 5. Automated Testing

All 14 unit and integration tests verify the end-to-end pipeline:
```powershell
python -m pytest tests -v
```

### Verified Test Summary:
```
tests/test_api.py::test_api_status PASSED
tests/test_api.py::test_api_statistics PASSED
tests/test_api.py::test_api_predict PASSED
tests/test_api.py::test_api_list_and_details PASSED
tests/test_api.py::test_api_analytics PASSED
tests/test_api.py::test_api_clear_all_predictions PASSED
tests/test_database.py::test_database_lifecycle PASSED
tests/test_database.py::test_database_clear_all PASSED
tests/test_model.py::test_model_loading_and_singleton PASSED
tests/test_model.py::test_model_feature_columns PASSED
tests/test_model.py::test_model_classes PASSED
tests/test_model.py::test_model_prediction_and_proba PASSED
tests/test_prediction.py::test_input_validation_valid PASSED
tests/test_prediction.py::test_input_validation_invalid_range PASSED
tests/test_prediction.py::test_prediction_high_quality PASSED
tests/test_prediction.py::test_prediction_low_quality PASSED

======================== 16 passed in 10.27s ========================
```

---

## 📊 6. Key Application Features

1. **Executive Dashboard:** Real-time KPI statistics (Total Samples, High, Medium, Low), interactive quality distribution donut, recent predictions table, and AI quality insight cards.
2. **Milk Quality Analysis:** Interactive 7-parameter testing form with real-time numeric bounds validation, segmented controls, model confidence progress indicators, and instant certificate downloads.
3. **Prediction History & Data Management:** SQLite persistence with sample search, quality filtering, date filtering, CSV export, single sample deletion, and **one-click "Clear All Data"** with safety confirmation.
4. **Analytics & Reports:** 12-week quality trends, chemical parameter comparisons across grades (pH, temperature, fat percentage), and executive printable HTML reports.
5. **Model Training & Evaluation Dashboard:** In-depth academic demonstration of dataset deduplication (976 duplicates removed from 1,059 to 83 unique records), 80:20 train-test partition (66 train / 17 test), Gaussian Naive Bayes likelihood mechanics, holdout test performance (14 correct / 3 incorrect = 82.35% accuracy), step-by-step mathematical formulation, and stratified 5-fold cross-validation (85.59% accuracy, 0.8518 macro F1).
6. **About the Model:** Architectural overview, ensemble tree topology, feature importance breakdown, and responsible AI usage guidelines.
7. **Settings & Themes:** Profile management, workspace configuration, automated low-quality alerts, and **full Dark Mode / Light Mode toggle** with persistent preferences.

---

## 🛡️ 7. Food Safety & Academic Disclaimer

MilkGuard AI is formulated as a decision-support and screening tool. Predictions are generated from statistical learning models based on physical parameters and do not constitute legal laboratory certifications or food safety warranties. All milk batches intended for commercial sale must comply with standard FSSAI / local regulatory health inspections.

