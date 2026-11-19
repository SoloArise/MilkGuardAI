"""
MilkGuard AI - FastAPI REST Backend
Exposes machine learning inference, SQLite persistence, and operational analytics for web & frontend clients.
"""

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from config.settings import (
    APP_NAME,
    APP_SUBTITLE,
    ORGANIZATION,
    MODEL_VERSION,
    MODEL_FEATURE_COLUMNS,
    TARGET_CLASSES,
)
from src.model_loader import get_model_loader
from src.prediction import predict_milk_sample, generate_sample_id
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
from src.analytics import (
    get_dataset_summary,
    get_historical_trends,
    get_parameter_comparison_data,
)
from src.report_generator import (
    generate_single_sample_report_html,
    generate_batch_summary_report_html,
)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Initialize Database and seed initial demo data
init_db()
seed_demo_data_if_needed()

app = FastAPI(
    title=APP_NAME,
    description=APP_SUBTITLE,
    version=MODEL_VERSION,
)

# Enable CORS for local Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SampleInputRequest(BaseModel):
    pH: float = Field(..., ge=0.0, le=14.0, description="Acidity / alkalinity (0-14)")
    temperature: float = Field(..., ge=0.0, le=100.0, description="Temperature in Celsius (0-100)")
    taste: int = Field(..., ge=0, le=1, description="Taste (1=Acceptable, 0=Unacceptable)")
    odor: int = Field(..., ge=0, le=1, description="Odor (1=Normal, 0=Abnormal)")
    fat: int = Field(..., ge=0, le=1, description="Fat presence (1=Present, 0=Absent)")
    turbidity: int = Field(..., ge=0, le=1, description="Clarity (0=Clear, 1=Turbid)")
    color: int = Field(..., ge=0, le=255, description="Photometric color intensity (0-255)")
    inspector_notes: Optional[str] = ""
    inspector_name: Optional[str] = "Alex Morgan"


@app.get("/api/status")
def get_system_status():
    """Returns application status, model metadata, and workspace configuration."""
    loader = get_model_loader()
    return {
        "app_name": APP_NAME,
        "organization": ORGANIZATION,
        "model_version": MODEL_VERSION,
        "is_model_loaded": loader.is_loaded,
        "metadata": loader.get_metadata(),
    }


@app.post("/api/predict")
def predict_sample(payload: SampleInputRequest):
    """Executes ML prediction on 7 milk sample parameters and commits to SQLite."""
    try:
        inputs_dict = {
            "pH": payload.pH,
            "temperature": payload.temperature,
            "taste": payload.taste,
            "odor": payload.odor,
            "fat": payload.fat,
            "turbidity": payload.turbidity,
            "color": payload.color,
        }
        res = predict_milk_sample(
            inputs_dict,
            save_to_db=True,
            inspector_name=payload.inspector_name,
            inspector_notes=payload.inspector_notes,
        )
        return res
    except Exception as ex:
        raise HTTPException(status_code=400, detail=str(ex))


@app.get("/api/predictions")
def list_predictions(
    limit: Optional[int] = Query(None, ge=1, le=500),
    quality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Lists historical sample prediction records with optional filtering."""
    q_filter = quality if isinstance(quality, str) else None
    s_filter = search if isinstance(search, str) else None
    lim = limit if isinstance(limit, int) else None
    df = get_all_predictions(limit=lim, quality_filter=q_filter, search_query=s_filter)
    return df.to_dict(orient="records")


@app.get("/api/predictions/{sample_id}")
def get_prediction(sample_id: str):
    """Fetches details for a single sample prediction."""
    rec = get_prediction_by_id(sample_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Sample {sample_id} not found.")
    return rec


@app.delete("/api/predictions")
def clear_all_history():
    """Clears all historical prediction records from the database."""
    deleted_count = clear_all_predictions()
    return {"status": "cleared", "deleted_count": deleted_count}


@app.delete("/api/predictions/{sample_id}")
def remove_prediction(sample_id: str):
    """Deletes a prediction record from history."""
    success = delete_prediction(sample_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found.")
    return {"status": "deleted", "sample_id": sample_id}


@app.get("/api/statistics")
def get_stats():
    """Returns aggregate quality counts, percentages, and pass rate."""
    return get_statistics()


@app.get("/api/analytics/trends")
def get_trends():
    """Returns weekly / temporal quality rates."""
    return get_historical_trends()


@app.get("/api/analytics/parameters")
def get_parameter_comparison():
    """Returns average parameters grouped by quality class."""
    return get_parameter_comparison_data()


@app.get("/api/analytics/dataset")
def get_dataset_info():
    """Returns benchmark dataset summary."""
    return get_dataset_summary()


@app.get("/api/reports/csv")
def download_csv():
    """Exports all stored predictions to CSV."""
    df = get_all_predictions()
    csv_str = df.to_csv(index=False)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=MilkGuard_History_{datetime.now().strftime('%Y%m%d')}.csv"},
    )


@app.get("/api/reports/sample/{sample_id}", response_class=HTMLResponse)
def download_sample_report(sample_id: str):
    """Returns a printable HTML inspection certificate for a single sample."""
    rec = get_prediction_by_id(sample_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Sample not found.")
    return generate_single_sample_report_html(rec)


@app.get("/api/reports/batch", response_class=HTMLResponse)
def download_batch_report():
    """Returns an executive operational summary HTML report."""
    return generate_batch_summary_report_html()


# Serve React Production Frontend if built
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
