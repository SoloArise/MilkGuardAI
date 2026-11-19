"""
MilkGuard AI - Prediction History Registry
Search, filter, view details, export records to CSV, and manage SQLite storage.
"""

import streamlit as st
import pandas as pd
from datetime import datetime

from config.settings import APP_NAME, THEME
from src.ui_components import apply_custom_theme, render_sidebar, render_page_header
from src.database import (
    get_all_predictions,
    delete_prediction,
    clear_all_predictions,
    get_prediction_by_id,
)
from src.report_generator import export_predictions_csv, generate_single_sample_report_html

# Page Setup
st.set_page_config(
    page_title=f"{APP_NAME} - Prediction History",
    page_icon="🕒",
    layout="wide",
)

apply_custom_theme()
render_sidebar()

render_page_header(
    eyebrow="RECORDS REGISTRY",
    title="Prediction History",
    subtitle="Search, filter, and review historical milk sample quality predictions stored in SQLite.",
)

# -------------------------------------------------------------
# Filters Bar
# -------------------------------------------------------------
filter_col1, filter_col2, filter_col3, filter_col4 = st.columns([1.5, 1.2, 1.2, 1])

with filter_col1:
    search_query = st.text_input("🔍 Search Sample ID or Notes", placeholder="e.g. MG-2841", key="hist_search")

with filter_col2:
    quality_filter = st.selectbox(
        "Quality Filter",
        options=["All", "High", "Medium", "Low"],
        index=0,
        key="hist_quality",
    )

with filter_col3:
    st.write("")
    st.write("")
    # Quick clear filters button
    if st.button("Clear Filters", use_container_width=True):
        st.session_state["hist_search"] = ""
        st.session_state["hist_quality"] = "All"
        st.rerun()

with filter_col4:
    st.write("")
    st.write("")
    # Export CSV action
    csv_bytes = get_all_predictions().to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Export CSV",
        data=csv_bytes,
        file_name=f"MilkGuard_Predictions_{datetime.now().strftime('%Y%m%d')}.csv",
        mime="text/csv",
        use_container_width=True,
    )

# -------------------------------------------------------------
# Load Data & Display
# -------------------------------------------------------------
df = get_all_predictions(
    quality_filter=quality_filter if quality_filter != "All" else None,
    search_query=search_query if search_query else None,
)

st.markdown(f"<div style='font-size: 0.82rem; color: #6E7C73; margin: 10px 0;'>Showing <strong>{len(df)}</strong> sample record(s) matching criteria</div>", unsafe_allow_html=True)

if df.empty:
    st.info("No prediction records found matching the current filters.")
else:
    # Format table for display
    display_df = df.copy()
    display_df["Fat Presence"] = display_df["fat"].apply(lambda x: "Present" if x == 1 else "Absent")
    display_df["Temp (°C)"] = display_df["temperature"].apply(lambda x: f"{x:.1f}°C")
    display_df["pH Level"] = display_df["ph"].apply(lambda x: f"{x:.1f}")
    display_df["Confidence"] = display_df["confidence"].apply(lambda x: f"{x:.1f}%")

    cols_to_show = ["sample_id", "created_at", "pH Level", "Temp (°C)", "Fat Presence", "predicted_label", "Confidence"]
    st.dataframe(
        display_df[cols_to_show].rename(columns={
            "sample_id": "Sample ID",
            "created_at": "Timestamp",
            "predicted_label": "Predicted Quality",
        }),
        use_container_width=True,
        hide_index=True,
    )

    # -------------------------------------------------------------
    # Record Inspector & Management Section
    # -------------------------------------------------------------
    st.markdown("---")
    st.markdown("### 🔎 Inspect Sample Record")
    sample_ids = df["sample_id"].tolist()
    
    inspect_c1, inspect_c2, inspect_c3 = st.columns([1.5, 1, 1])
    with inspect_c1:
        selected_id = st.selectbox("Select Sample ID to view complete lab details", options=sample_ids)

    if selected_id:
        record = get_prediction_by_id(selected_id)
        if record:
            with st.expander(f"Detailed Analysis Report for {selected_id}", expanded=True):
                q = str(record["predicted_quality"]).lower()
                status_color = "#216B45" if q == "high" else ("#D98B24" if q == "medium" else "#BB5A55")

                d_c1, d_c2, d_c3, d_c4 = st.columns(4)
                d_c1.metric("Predicted Quality", record["predicted_label"])
                d_c2.metric("Confidence Score", f"{record['confidence']:.1f}%")
                d_c3.metric("pH Value", f"{record['ph']:.2f}")
                d_c4.metric("Sample Temp", f"{record['temperature']:.1f} °C")

                p_c1, p_c2, p_c3, p_c4 = st.columns(4)
                p_c1.metric("Taste", "Acceptable" if record["taste"] == 1 else "Unacceptable")
                p_c2.metric("Odor", "Normal" if record["odor"] == 1 else "Abnormal")
                p_c3.metric("Turbidity", "Clear" if record["turbidity"] == 0 else "Turbid")
                p_c4.metric("Color Value", f"{record['color']} RGB")

                if record.get("inspector_notes"):
                    st.info(f"Inspector Notes: {record['inspector_notes']}")

                act_c1, act_c2 = st.columns([1, 1])
                with act_c1:
                    # Download certificate
                    single_html = generate_single_sample_report_html(record)
                    st.download_button(
                        label=f"📄 Download Lab Certificate ({selected_id})",
                        data=single_html,
                        file_name=f"Certificate_{selected_id}.html",
                        mime="text/html",
                        key=f"dl_{selected_id}",
                    )
                    with act_c2:
                        # Delete action
                        if st.button(f"🗑️ Delete Record ({selected_id})", key=f"del_{selected_id}", type="secondary"):
                            delete_prediction(selected_id)
                            st.success(f"Record {selected_id} deleted successfully.")
                            st.rerun()

    # -------------------------------------------------------------
    # Danger Zone: Clear All Records
    # -------------------------------------------------------------
    st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)
    with st.expander("⚠️ Data Management & Danger Zone"):
        st.markdown(
            f"""
            <div style="font-size: 0.85rem; color: #BB5A55; font-weight: 600; margin-bottom: 6px;">
                Permanently Clear All Prediction History
            </div>
            <div style="font-size: 0.8rem; color: #6E7C73; margin-bottom: 12px;">
                This will delete all <strong>{len(df)}</strong> records currently stored in the SQLite database and reset dashboard statistics. This action is irreversible.
            </div>
            """,
            unsafe_allow_html=True,
        )
        confirm_clear = st.checkbox("I understand that this will permanently delete all records.", key="confirm_clear_all_st")
        if st.button("🗑️ Clear All Prediction Data", type="primary", disabled=not confirm_clear):
            deleted_count = clear_all_predictions()
            st.toast(f"Cleared {deleted_count} record(s) from database.", icon="🗑️")
            st.success(f"Successfully cleared {deleted_count} sample record(s).")
            st.rerun()

