"""
MilkGuard AI - Report Generation Module
Generates downloadable CSV exports and formatted printable HTML/PDF quality reports.
"""

from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd

from config.settings import REPORTS_DIR, APP_NAME, ORGANIZATION, DISCLAIMER_TEXT
from src.database import get_all_predictions, get_statistics


def export_predictions_csv(output_path: Optional[Path] = None) -> Path:
    """Exports all stored predictions to a CSV file."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    if output_path is None:
        filename = f"MilkGuard_Prediction_History_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        output_path = REPORTS_DIR / filename

    df = get_all_predictions()
    df.to_csv(output_path, index=False)
    return output_path


def generate_single_sample_report_html(sample_record: Dict[str, Any]) -> str:
    """Creates a beautifully styled printable HTML quality inspection report for a single sample."""
    q_lower = str(sample_record.get("predicted_quality", "high")).lower()
    if q_lower == "high":
        badge_color = "#216B45"
        badge_bg = "#E8F5EC"
        badge_text = "HIGH QUALITY"
    elif q_lower == "medium":
        badge_color = "#D98B24"
        badge_bg = "#FFF3DC"
        badge_text = "MEDIUM QUALITY"
    else:
        badge_color = "#BB5A55"
        badge_bg = "#FAECEB"
        badge_text = "LOW QUALITY"

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MilkGuard AI - Sample Report {sample_record.get('sample_id')}</title>
<style>
  body {{ font-family: 'Segoe UI', Inter, Arial, sans-serif; color: #26332B; background: #fff; margin: 40px; }}
  .header {{ border-bottom: 2px solid #216B45; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }}
  .brand {{ font-size: 24px; font-weight: bold; color: #216B45; }}
  .meta {{ font-size: 13px; color: #6E7C73; text-align: right; }}
  .badge {{ display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 14px; background: {badge_bg}; color: {badge_color}; }}
  .card {{ border: 1px solid #E4EAE6; border-radius: 12px; padding: 20px; margin-bottom: 20px; }}
  .grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }}
  .param-item {{ display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding: 8px 0; }}
  .param-label {{ color: #6E7C73; font-size: 14px; }}
  .param-val {{ font-weight: 600; font-size: 14px; }}
  .disclaimer {{ background: #F8FAF8; border-left: 4px solid #216B45; padding: 12px 16px; font-size: 12px; color: #6E7C73; margin-top: 30px; }}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">🥛 {APP_NAME}</div>
      <div style="font-size: 13px; color: #6E7C73;">{ORGANIZATION} — Quality Assurance Division</div>
    </div>
    <div class="meta">
      <div><strong>Sample ID:</strong> {sample_record.get('sample_id')}</div>
      <div><strong>Timestamp:</strong> {sample_record.get('created_at')}</div>
      <div><strong>Inspector:</strong> {sample_record.get('inspector_name', 'Alex Morgan')}</div>
    </div>
  </div>

  <div class="card" style="background: #FAFDFB; border-color: #C3E2CD;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 12px; font-weight: bold; color: #6E7C73; text-transform: uppercase;">Prediction Result</div>
        <div style="font-size: 22px; font-weight: bold; margin-top: 4px;">{sample_record.get('predicted_label')}</div>
      </div>
      <div>
        <span class="badge">{badge_text}</span>
      </div>
    </div>
    <div style="margin-top: 14px; font-size: 14px; color: #26332B;">
      <strong>Model Confidence:</strong> {sample_record.get('confidence', 0)}%
      &nbsp;|&nbsp; <strong>Algorithm:</strong> Random Forest Classifier
    </div>
  </div>

  <div class="card">
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #E4EAE6; padding-bottom: 8px;">
      Sample Laboratory Measurements
    </div>
    <div class="grid">
      <div class="param-item"><span class="param-label">pH Level:</span><span class="param-val">{sample_record.get('ph')} pH</span></div>
      <div class="param-item"><span class="param-label">Temperature:</span><span class="param-val">{sample_record.get('temperature')} °C</span></div>
      <div class="param-item"><span class="param-label">Taste:</span><span class="param-val">{'Acceptable' if sample_record.get('taste') == 1 else 'Unacceptable'}</span></div>
      <div class="param-item"><span class="param-label">Odor:</span><span class="param-val">{'Normal' if sample_record.get('odor') == 1 else 'Abnormal'}</span></div>
      <div class="param-item"><span class="param-label">Fat Content:</span><span class="param-val">{'Present / Optimal' if sample_record.get('fat') == 1 else 'Absent / Deficient'}</span></div>
      <div class="param-item"><span class="param-label">Turbidity:</span><span class="param-val">{'Clear / Optimal' if sample_record.get('turbidity') == 0 else 'Turbid / Clouded'}</span></div>
      <div class="param-item"><span class="param-label">Color Value:</span><span class="param-val">{sample_record.get('color')} RGB</span></div>
      <div class="param-item"><span class="param-label">Inspector Notes:</span><span class="param-val">{sample_record.get('inspector_notes') or 'None'}</span></div>
    </div>
  </div>

  <div class="disclaimer">
    <strong>Notice:</strong> {DISCLAIMER_TEXT}
  </div>
</body>
</html>
"""
    return html


def generate_batch_summary_report_html() -> str:
    """Generates an HTML summary report of the overall inspection operations."""
    stats = get_statistics()
    df = get_all_predictions(limit=50)

    rows_html = ""
    for _, row in df.iterrows():
        q = str(row["predicted_quality"]).lower()
        color = "#216B45" if q == "high" else ("#D98B24" if q == "medium" else "#BB5A55")
        rows_html += f"""
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>{row['sample_id']}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">{row['created_at']}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">{row['ph']}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">{row['temperature']} °C</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">{'Present' if row['fat'] == 1 else 'Absent'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: {color};">{row['predicted_label']}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">{row['confidence']}%</td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>MilkGuard AI - Inspection Operations Summary</title>
<style>
  body {{ font-family: 'Segoe UI', Inter, Arial, sans-serif; color: #26332B; background: #fff; margin: 40px; }}
  .header {{ border-bottom: 2px solid #216B45; padding-bottom: 16px; margin-bottom: 24px; }}
  .brand {{ font-size: 24px; font-weight: bold; color: #216B45; }}
  .stat-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }}
  .stat-box {{ border: 1px solid #E4EAE6; border-radius: 10px; padding: 14px; text-align: center; }}
  .stat-val {{ font-size: 24px; font-weight: bold; color: #216B45; }}
  .stat-lbl {{ font-size: 12px; color: #6E7C73; text-transform: uppercase; margin-top: 4px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }}
  th {{ background: #F8FAF8; padding: 10px 8px; text-align: left; border-bottom: 2px solid #E4EAE6; color: #6E7C73; }}
  .disclaimer {{ background: #F8FAF8; border-left: 4px solid #216B45; padding: 12px 16px; font-size: 12px; color: #6E7C73; margin-top: 30px; }}
</style>
</head>
<body>
  <div class="header">
    <div class="brand">🥛 {APP_NAME} — Executive Operations Report</div>
    <div style="font-size: 13px; color: #6E7C73;">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | {ORGANIZATION}</div>
  </div>

  <div class="stat-grid">
    <div class="stat-box">
      <div class="stat-val">{stats['total_samples']}</div>
      <div class="stat-lbl">Total Samples</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #216B45;">{stats['high_count']} ({stats['high_pct']}%)</div>
      <div class="stat-lbl">High Quality</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #D98B24;">{stats['medium_count']} ({stats['medium_pct']}%)</div>
      <div class="stat-lbl">Medium Quality</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #BB5A55;">{stats['low_count']} ({stats['low_pct']}%)</div>
      <div class="stat-lbl">Low Quality</div>
    </div>
  </div>

  <h3>Recent Sample Records (Latest {len(df)})</h3>
  <table>
    <thead>
      <tr>
        <th>Sample ID</th>
        <th>Date & Time</th>
        <th>pH</th>
        <th>Temp</th>
        <th>Fat</th>
        <th>Predicted Quality</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      {rows_html if rows_html else '<tr><td colspan="7" style="text-align:center; padding: 20px;">No records found.</td></tr>'}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
  </div>
</body>
</html>
"""
    return html

