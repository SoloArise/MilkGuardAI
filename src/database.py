"""
MilkGuard AI - SQLite Database Operations
Manages persistence of milk sample predictions, history, audit trail, and aggregate stats.
"""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

from config.settings import DB_PATH, DATABASE_DIR


def get_connection() -> sqlite3.Connection:
    """Creates a thread-safe connection to the SQLite database."""
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for high performance & concurrency
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def init_db():
    """Initializes database schema and indexes."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sample_id TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ph REAL NOT NULL,
                temperature REAL NOT NULL,
                taste INTEGER NOT NULL,
                odor INTEGER NOT NULL,
                fat INTEGER NOT NULL,
                turbidity INTEGER NOT NULL,
                color INTEGER NOT NULL,
                predicted_quality TEXT NOT NULL,
                predicted_label TEXT NOT NULL,
                confidence REAL NOT NULL,
                proba_high REAL DEFAULT 0.0,
                proba_medium REAL DEFAULT 0.0,
                proba_low REAL DEFAULT 0.0,
                model_version TEXT DEFAULT 'v2.4.1',
                inspector_name TEXT DEFAULT 'Alex Morgan',
                inspector_notes TEXT DEFAULT ''
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sample_id ON predictions(sample_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON predictions(created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_quality ON predictions(predicted_quality);")
        conn.commit()


def insert_prediction(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Inserts a validated prediction record into SQLite.
    
    Args:
        record: Dictionary with sample metadata, features, and model output.
        
    Returns:
        The inserted record dictionary including generated timestamp and row ID.
    """
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        cursor.execute("""
            INSERT INTO predictions (
                sample_id, created_at, ph, temperature, taste, odor, fat,
                turbidity, color, predicted_quality, predicted_label,
                confidence, proba_high, proba_medium, proba_low,
                model_version, inspector_name, inspector_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["sample_id"],
            record.get("created_at", now_str),
            float(record["ph"]),
            float(record["temperature"]),
            int(record["taste"]),
            int(record["odor"]),
            int(record["fat"]),
            int(record["turbidity"]),
            int(record["color"]),
            str(record["predicted_quality"]).lower().strip(),
            str(record["predicted_label"]),
            float(record.get("confidence", 0.0)),
            float(record.get("proba_high", 0.0)),
            float(record.get("proba_medium", 0.0)),
            float(record.get("proba_low", 0.0)),
            record.get("model_version", "v2.4.1"),
            record.get("inspector_name", "Alex Morgan"),
            record.get("inspector_notes", ""),
        ))
        conn.commit()
        record_id = cursor.lastrowid

    record["id"] = record_id
    if "created_at" not in record:
        record["created_at"] = now_str
    return record


def get_all_predictions(
    limit: Optional[int] = None,
    quality_filter: Optional[str] = None,
    search_query: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> pd.DataFrame:
    """
    Retrieves filtered predictions from the database as a Pandas DataFrame.
    """
    init_db()
    with get_connection() as conn:
        query = "SELECT * FROM predictions WHERE 1=1"
        params: List[Any] = []

        if quality_filter and quality_filter.lower() != "all":
            query += " AND LOWER(predicted_quality) = ?"
            params.append(quality_filter.lower().strip())

        if search_query:
            query += " AND (sample_id LIKE ? OR inspector_notes LIKE ?)"
            params.append(f"%{search_query.strip()}%")
            params.append(f"%{search_query.strip()}%")

        if start_date:
            query += " AND DATE(created_at) >= DATE(?)"
            params.append(start_date)

        if end_date:
            query += " AND DATE(created_at) <= DATE(?)"
            params.append(end_date)

        query += " ORDER BY created_at DESC"

        if limit:
            query += " LIMIT ?"
            params.append(limit)

        df = pd.read_sql_query(query, conn, params=params)
        return df


def get_prediction_by_id(sample_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single prediction record by sample_id."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions WHERE sample_id = ?", (sample_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def delete_prediction(sample_id: str) -> bool:
    """Deletes a prediction record by sample_id."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions WHERE sample_id = ?", (sample_id,))
        conn.commit()
        return cursor.rowcount > 0


def clear_all_predictions() -> int:
    """Deletes all prediction records from SQLite history."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions;")
        conn.commit()
        return cursor.rowcount


def get_statistics() -> Dict[str, Any]:
    """Computes dynamic summary statistics from the predictions table."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM predictions;")
        total = cursor.fetchone()[0]

        if total == 0:
            return {
                "total_samples": 0,
                "high_count": 0,
                "high_pct": 0.0,
                "medium_count": 0,
                "medium_pct": 0.0,
                "low_count": 0,
                "low_pct": 0.0,
                "avg_confidence": 0.0,
                "pass_rate": 0.0,
            }

        cursor.execute("""
            SELECT 
                SUM(CASE WHEN LOWER(predicted_quality) = 'high' THEN 1 ELSE 0 END) AS high_cnt,
                SUM(CASE WHEN LOWER(predicted_quality) = 'medium' THEN 1 ELSE 0 END) AS med_cnt,
                SUM(CASE WHEN LOWER(predicted_quality) = 'low' THEN 1 ELSE 0 END) AS low_cnt,
                AVG(confidence) AS avg_conf
            FROM predictions;
        """)
        row = cursor.fetchone()
        high_cnt = row["high_cnt"] or 0
        med_cnt = row["med_cnt"] or 0
        low_cnt = row["low_cnt"] or 0
        avg_conf = round(float(row["avg_conf"] or 0.0), 1)

        pass_rate = round(((high_cnt + med_cnt) / total) * 100, 1)

        return {
            "total_samples": total,
            "high_count": high_cnt,
            "high_pct": round((high_cnt / total) * 100, 1),
            "medium_count": med_cnt,
            "medium_pct": round((med_cnt / total) * 100, 1),
            "low_count": low_cnt,
            "low_pct": round((low_cnt / total) * 100, 1),
            "avg_confidence": avg_conf,
            "pass_rate": pass_rate,
        }


def seed_demo_data_if_needed(force: bool = False):
    """
    Seeds initial realistic sample records from the prompt if the DB is empty.
    Allows testing of dashboard tables, charts, and history immediately.
    """
    init_db()
    stats = get_statistics()
    if stats["total_samples"] > 0 and not force:
        return

    demo_records = [
        {
            "sample_id": "MG-2841",
            "created_at": "2026-05-24 10:42:00",
            "ph": 6.7,
            "temperature": 36.4,
            "taste": 1,
            "odor": 1,
            "fat": 1,
            "turbidity": 0,
            "color": 254,
            "predicted_quality": "high",
            "predicted_label": "High Quality",
            "confidence": 96.8,
            "proba_high": 0.968,
            "proba_medium": 0.032,
            "proba_low": 0.000,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Morning tank batch A. Optimal freshness.",
        },
        {
            "sample_id": "MG-2840",
            "created_at": "2026-05-24 09:18:00",
            "ph": 6.4,
            "temperature": 38.1,
            "taste": 1,
            "odor": 0,
            "fat": 1,
            "turbidity": 1,
            "color": 252,
            "predicted_quality": "medium",
            "predicted_label": "Medium Quality",
            "confidence": 88.5,
            "proba_high": 0.085,
            "proba_medium": 0.885,
            "proba_low": 0.030,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Slight temperature elevation upon arrival.",
        },
        {
            "sample_id": "MG-2839",
            "created_at": "2026-05-23 16:36:00",
            "ph": 5.9,
            "temperature": 41.2,
            "taste": 0,
            "odor": 0,
            "fat": 0,
            "turbidity": 1,
            "color": 242,
            "predicted_quality": "low",
            "predicted_label": "Low Quality",
            "confidence": 94.2,
            "proba_high": 0.005,
            "proba_medium": 0.053,
            "proba_low": 0.942,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Substandard sample. Acidity and high temp indicate souring.",
        },
        {
            "sample_id": "MG-2838",
            "created_at": "2026-05-23 14:11:00",
            "ph": 6.8,
            "temperature": 35.8,
            "taste": 1,
            "odor": 1,
            "fat": 1,
            "turbidity": 0,
            "color": 255,
            "predicted_quality": "high",
            "predicted_label": "High Quality",
            "confidence": 98.4,
            "proba_high": 0.984,
            "proba_medium": 0.016,
            "proba_low": 0.000,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Chilled bulk delivery from farm B.",
        },
        {
            "sample_id": "MG-2837",
            "created_at": "2026-05-22 11:52:00",
            "ph": 6.5,
            "temperature": 37.4,
            "taste": 1,
            "odor": 1,
            "fat": 1,
            "turbidity": 1,
            "color": 250,
            "predicted_quality": "medium",
            "predicted_label": "Medium Quality",
            "confidence": 85.0,
            "proba_high": 0.120,
            "proba_medium": 0.850,
            "proba_low": 0.030,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Acceptable for secondary processing.",
        },
        {
            "sample_id": "MG-2836",
            "created_at": "2026-05-21 08:30:00",
            "ph": 6.6,
            "temperature": 36.0,
            "taste": 1,
            "odor": 1,
            "fat": 1,
            "turbidity": 0,
            "color": 253,
            "predicted_quality": "high",
            "predicted_label": "High Quality",
            "confidence": 97.1,
            "proba_high": 0.971,
            "proba_medium": 0.029,
            "proba_low": 0.000,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Standard morning intake.",
        },
        {
            "sample_id": "MG-2835",
            "created_at": "2026-05-20 17:15:00",
            "ph": 4.8,
            "temperature": 45.0,
            "taste": 0,
            "odor": 0,
            "fat": 0,
            "turbidity": 1,
            "color": 240,
            "predicted_quality": "low",
            "predicted_label": "Low Quality",
            "confidence": 98.9,
            "proba_high": 0.001,
            "proba_medium": 0.010,
            "proba_low": 0.989,
            "model_version": "v2.4.1",
            "inspector_name": "Alex Morgan",
            "inspector_notes": "Rejected at dock due to severe spoilage.",
        },
    ]

    for rec in demo_records:
        try:
            insert_prediction(rec)
        except Exception:
            pass

