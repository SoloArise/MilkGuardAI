# 🥛 MilkGuard AI – Intelligent Milk Quality Analysis and Classification System

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![Scikit-Learn 1.6+](https://img.shields.io/badge/Scikit--Learn-Multi--Model-orange.svg)](https://scikit-learn.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.40%2B-FF4B4B.svg)](https://streamlit.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19%20%2B%20Vite%20%2B%20Tailwind%20v4-61DAFB.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)](https://pytest.org/)

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

### Benchmark Dataset
- **Sourcing:** Reference benchmark dairy quality dataset (`data/milk_quality_dataset.csv`, 1,059 raw samples).
- **Features (7 Input Variables):**
  1. `pH`: Continuous measure of acidity / alkalinity (allowed: `0.0–14.0`; optimal fresh milk: `6.5–6.8`).
  2. `Temprature`: Sample temperature in Celsius (allowed: `0.0–100.0°C`; typical fresh milk: `34.0–40.0°C`).
  3. `Taste`: Sensory taste evaluation (`1`: Acceptable / Optimal, `0`: Substandard).
  4. `Odor`: Sensory smell evaluation (`1`: Normal / Fresh, `0`: Abnormal / Sour).
  5. `Fat`: Standard fat content presence (`1`: Present / Optimal, `0`: Absent).
  6. `Turbidity`: Light scattering and clarity (`0`: Clear / Optimal, `1`: Turbid / Impurities).
  7. `Colour`: Photometric whiteness measurement (`0–255` RGB scale; benchmark: `240–255`).
- **Raw Class Distribution (1,059 Samples):**
  - `low`: 429 samples (40.5%)
  - `medium`: 374 samples (35.3%)
  - `high`: 256 samples (24.2%)

---

### Deduplication & Academic Leakage Prevention
Exact-row inspection of the raw dataset reveals substantial redundancy:
- **Duplicate Rows Removed:** 976 exact identical rows identified and filtered.
- **Unique Ground-Truth Observations:** **83 unique records** remain.
  - `high`: 23 unique samples (27.7%)
  - `low`: 26 unique samples (31.3%)
  - `medium`: 34 unique samples (41.0%)
- **Data Leakage Mitigation:** Training and testing directly on the un-deduplicated 1,059-sample dataset causes identical physical rows to exist in both training and test splits, artificially inflating holdout accuracy to ~99.5–100%. Evaluating on the deduplicated 83-sample partition ensures real generalization testing on unseen feature vectors.

---

### Multi-Model Comparative Evaluation Framework (`scripts/train_evaluate.py`)

A standalone, fully reproducible training and evaluation pipeline evaluates **three candidate machine learning algorithms** on the deduplicated dataset using a stratified **80:20 train-test partition** (66 training samples / 17 unseen testing samples) paired with **Stratified 5-Fold Cross-Validation** on the training partition:

```
Unfiltered Dataset (1,059 samples)
       │
       ▼ [Exact-Row Deduplication]
Deduplicated Ground Truth (83 unique samples)
       │
       ├── Stratified 80% Train Partition (66 samples) ──► 5-Fold Stratified Cross-Validation
       │
       └── Stratified 20% Unseen Holdout (17 samples)  ──► Final Generalization Benchmark
```

#### Holdout Test Split (17 Withheld Samples: 5 High, 5 Low, 7 Medium)

| Model / Algorithm | Holdout Accuracy | Balanced Accuracy | Macro Precision | Macro Recall | Macro F1 | CV Mean Acc (± Std) | CV Macro F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gaussian Naive Bayes (`GaussianNB`)** | **82.35%** (14/17) | **79.99%** | **85.93%** | **79.99%** | **0.8083** | 84.84% (± 0.1089) | **0.8732** |
| **Random Forest (`RandomForestClassifier`)** | 76.47% (13/17) | 73.33% | 81.55% | 73.33% | 0.7238 | **86.26%** (± 0.0763) | 0.8634 |
| **Support Vector Machine (`SVC` + Scaler)** | 64.71% (11/17) | 63.81% | 65.83% | 63.81% | 0.6444 | 77.25% (± 0.1289) | 0.7574 |

#### Production Model Artifacts
- **Primary Production Model:** `models/milk_quality_model.pkl` (and `models/milk_quality_model.joblib`) – Random Forest Classifier (200 trees, balanced weights, Gini criterion).
- **Candidate Serialized Models:**
  - `models/random_forest_candidate.joblib`
  - `models/gaussian_nb_candidate.joblib`
  - `models/svm_candidate.joblib`
- **Evaluation Outputs:** `reports/model_comparison.json`, `reports/model_comparison.csv`, and per-model confusion matrices (`*_confusion_matrix.csv`) and classification reports (`*_classification_report.json`).

---

## 🏗️ 3. Project Architecture

```
MilkGuard-AI/
├── app.py                             # Main Streamlit Entry Point & Multi-Metric Dashboard
├── config/
│   └── settings.py                    # Global constants, validation boundaries, file paths
├── data/
│   └── milk_quality_dataset.csv       # Benchmark 1,059-sample dairy dataset
├── models/
│   ├── milk_quality_model.pkl         # Production Random Forest serialized pickle
│   ├── milk_quality_model.joblib      # Production Random Forest serialized joblib
│   ├── random_forest_candidate.joblib # Evaluated Random Forest candidate model
│   ├── gaussian_nb_candidate.joblib   # Evaluated Gaussian Naive Bayes candidate model
│   └── svm_candidate.joblib           # Evaluated Support Vector Machine candidate model
├── database/
│   └── history.db                     # SQLite WAL-mode prediction registry
├── reports/
│   ├── model_comparison.json          # Canonical 3-model comparative evaluation metrics
│   ├── model_comparison.csv           # Tabular export of model comparison metrics
│   ├── random_forest_confusion_matrix.csv
│   ├── random_forest_classification_report.json
│   ├── gaussian_nb_confusion_matrix.csv
│   ├── gaussian_nb_classification_report.json
│   ├── svm_confusion_matrix.csv
│   └── svm_classification_report.json
├── scripts/
│   └── train_evaluate.py              # Reproducible dataset validation & multi-model evaluation
├── src/
│   ├── __init__.py
│   ├── model_loader.py                # Thread-safe singleton model loader & dynamic parameter introspection
│   ├── preprocessing.py               # Strict schema & feature order transformer
│   ├── prediction.py                  # Inference engine & probabilistic scoring
│   ├── database.py                    # SQLite CRUD & dynamic analytics calculator
│   ├── analytics.py                   # Trends, parameter benchmarks & evaluation loader
│   ├── report_generator.py            # Downloadable CSV & printable HTML certificates
│   ├── validation.py                  # Parameter bounds & type sanity validation
│   └── ui_components.py               # Shared B2B SaaS navigation & CSS helpers
├── pages/
│   ├── 2_🧪_Milk_Analysis.py          # 7-parameter interactive prediction form
│   ├── 3_🕒_Prediction_History.py     # Search, filter, inspect, and delete records
│   ├── 4_📈_Analytics_Reports.py      # 12-week quality trend & parameter comparisons
│   ├── 5_🔬_Model_Training_Evaluation.py # Academic deduplication & 3-model evaluation metrics
│   ├── 6_🧠_About_Model.py            # Dynamic model architecture & feature importance
│   └── 7_⚙️_Settings.py               # Inspector profile, alerts & configuration
├── assets/
│   ├── logo.svg                       # Vector brand mark
│   └── custom.css                     # Forest-green B2B SaaS styling
├── api/
│   └── server.py                      # FastAPI REST backend serving predictions & React bundle
├── frontend/                          # High-fidelity React 19 + Vite + Tailwind CSS v4 dashboard
│   ├── dist/                          # Compiled production SPA assets (served by FastAPI)
│   ├── src/
│   │   ├── components/                # Sidebar, TopNav, SVG Icons, RecordModal
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx      # Executive overview & real-time KPI metrics
│   │   │   ├── AnalysisPage.tsx       # Live 7-parameter testing form with dynamic holdout banner
│   │   │   ├── HistoryPage.tsx        # Search, quality filter, CSV export, record deletion
│   │   │   ├── AnalyticsPage.tsx      # Trends, quality distribution & parameter comparison
│   │   │   ├── ModelTrainingPage.tsx  # Dynamic multi-model comparison table & confusion matrices
│   │   │   ├── AboutModelPage.tsx     # Dynamic model introspection loaded from /api/status
│   │   │   └── SettingsPage.tsx       # Profile management, alerts, and theme preferences
│   │   ├── App.tsx                    # Main React client application & state management
│   │   └── types.ts                   # TypeScript interfaces matching backend models
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   ├── test_model.py                  # Model loader & predict_proba test cases
│   ├── test_prediction.py             # Range validation & inference tests
│   ├── test_database.py               # SQLite CRUD & stats tests
│   └── test_api.py                    # REST endpoints router tests (including 503 fallback)
├── requirements.txt                   # Python package dependencies
├── README.md                          # Comprehensive system documentation
└── .gitignore
```

---

## 🚀 4. Installation & Execution Guide (Windows)

### Prerequisites
- Python 3.12+ (tested and compatible with Python 3.14)
- Node.js 18+ & npm (for React frontend)

### Step 1: Set Up Python Virtual Environment
```powershell
# Navigate to the workspace directory
cd "F:\Harsh\Erudite\Graphic Era\Semester 3\Mini Project\Milk Analysis using ML"

# Create a virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 2: (Optional) Run Model Evaluation & Benchmark Comparison
To re-run the deduplication and generate the multi-model comparison reports (`reports/model_comparison.json`, CSVs, and confusion matrices):
```powershell
python scripts/train_evaluate.py
```

### Step 3: Run the Streamlit Multi-Page Application (Academic UI)
```powershell
streamlit run app.py
```
*The Streamlit interface will launch in your browser at `http://localhost:8501`.*

### Step 4: Run the FastAPI + React Production Interface
```powershell
# Run the FastAPI server (serves REST API and compiled React SPA at frontend/dist)
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000 --reload
```
*Open `http://localhost:8000` to interact with the high-fidelity React SaaS dashboard.*

### Step 5 (Optional): Run the Vite Frontend in Hot-Reload Development Mode
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` to test Vite hot-module replacement connected to the FastAPI backend.*

---

## 🧪 5. Automated Testing

All 17 unit and integration tests verify the end-to-end pipeline (model loading, inference, input validation, SQLite database operations, and REST API endpoints):

```powershell
python -m pytest tests --basetemp=.pytest_temp -v
```

### Verified Test Summary:
```
tests/test_api.py::test_api_status PASSED                                [  5%]
tests/test_api.py::test_api_statistics PASSED                            [ 11%]
tests/test_api.py::test_api_predict PASSED                               [ 17%]
tests/test_api.py::test_api_list_and_details PASSED                      [ 23%]
tests/test_api.py::test_api_analytics PASSED                             [ 29%]
tests/test_api.py::test_training_evaluation_unavailable PASSED           [ 35%]
tests/test_api.py::test_api_clear_all_predictions PASSED                 [ 41%]
tests/test_database.py::test_database_lifecycle PASSED                   [ 47%]
tests/test_database.py::test_database_clear_all PASSED                   [ 52%]
tests/test_model.py::test_model_loading_and_singleton PASSED             [ 58%]
tests/test_model.py::test_model_feature_columns PASSED                   [ 64%]
tests/test_model.py::test_model_classes PASSED                           [ 70%]
tests/test_model.py::test_model_prediction_and_proba PASSED              [ 76%]
tests/test_prediction.py::test_input_validation_valid PASSED             [ 82%]
tests/test_prediction.py::test_input_validation_invalid_range PASSED     [ 88%]
tests/test_prediction.py::test_prediction_high_quality PASSED            [ 94%]
tests/test_prediction.py::test_prediction_low_quality PASSED             [100%]

======================== 17 passed in 3.47s ========================
```

---

## 🌐 6. REST API Reference

The FastAPI backend exposes comprehensive endpoints powering both the React web application and third-party integrations:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Returns system health, loaded model algorithm, parameters, and feature list. |
| `POST` | `/api/predict` | Predicts quality class (High/Medium/Low) for 7 parameters and stores record in SQLite. |
| `GET` | `/api/predictions` | Retrieves historical samples with optional `limit`, `quality`, and `search` query filters. |
| `GET` | `/api/predictions/{sample_id}` | Fetches detailed parameters and prediction confidence for a single sample. |
| `DELETE` | `/api/predictions/{sample_id}` | Deletes an individual prediction record by sample ID. |
| `DELETE` | `/api/predictions` | Clears all historical prediction records from the database. |
| `GET` | `/api/statistics` | Returns aggregate counts, percentages, pass rate, and average model confidence. |
| `GET` | `/api/analytics/trends` | Returns temporal/weekly quality breakdown for trending charts. |
| `GET` | `/api/analytics/parameters` | Returns chemical parameter benchmarks (pH, temperature, fat) grouped by grade. |
| `GET` | `/api/analytics/dataset` | Returns summary and class distribution of the reference benchmark dataset. |
| `GET` | `/api/analytics/training-evaluation` | Returns generated 3-model comparative evaluation data (or 503 if unavailable). |
| `GET` | `/api/reports/csv` | Streams all prediction records as a downloadable CSV spreadsheet. |
| `GET` | `/api/reports/sample/{sample_id}` | Renders a printable HTML inspection certificate for a specific sample. |
| `GET` | `/api/reports/batch` | Generates an executive operational summary HTML report. |

---

## 📊 7. Key Application Features

1. **Executive Dashboard:** Real-time KPI statistics (Total Samples, High, Medium, Low), interactive quality distribution donut, recent predictions table, and AI quality insight cards.
2. **Milk Quality Analysis:** Interactive 7-parameter testing form with real-time numeric bounds validation, segmented controls, model confidence indicators, dynamic holdout accuracy banner, and instant printable certificate generation.
3. **Prediction History & Data Management:** SQLite persistence with sample search, quality filtering, date filtering, CSV export, single sample deletion, and **one-click "Clear All Data"** with safety confirmation.
4. **Analytics & Reports:** 12-week quality trends, chemical parameter comparisons across grades (pH, temperature, fat percentage), and executive printable HTML reports.
5. **Multi-Model Comparative Training & Evaluation Dashboard:**
   - Visualizes exact-row deduplication (976 redundant entries removed from 1,059 raw records to 83 unique observation vectors).
   - Side-by-side comparative benchmarking of **Random Forest**, **Gaussian Naive Bayes**, and **Support Vector Machine (SVM)**.
   - Holdout test evaluation metrics (Accuracy, Balanced Accuracy, Macro Precision, Macro Recall, Macro F1) and Stratified 5-Fold Cross-Validation distributions (mean ± standard deviation).
   - Confusion matrix heatmaps and per-class precision/recall/F1 metrics.
6. **About the Model (Dynamic Introspection):**
   - Automatically reads the currently active production model from `/api/status`.
   - Displays algorithm details, hyperparameters, and feature importance / variance weights for Random Forest, Gaussian Naive Bayes, or SVM pipelines.
7. **Settings & Themes:** Inspector profile management, workspace configuration, automated low-quality alerts, and **full Dark Mode / Light Mode toggle** with persistent localStorage preferences.

---

## 🛡️ 8. Food Safety & Academic Disclaimer

MilkGuard AI is formulated as a decision-support and screening tool. Predictions are generated from statistical learning models based on physical parameters and do not constitute legal laboratory certifications or food safety warranties. All milk batches intended for commercial sale must comply with standard FSSAI / local regulatory health inspections.
