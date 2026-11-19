"""
MilkGuard AI - Milk Quality Analysis Page
Interactive Parameter Input & Real-Time Machine Learning Inference Engine
"""

import streamlit as st
from config.settings import APP_NAME, VALIDATION_RULES, THEME, DISCLAIMER_TEXT
from src.ui_components import apply_custom_theme, render_sidebar, render_page_header
from src.prediction import predict_milk_sample
from src.model_loader import get_model_loader
from src.report_generator import generate_single_sample_report_html

# Page Setup
st.set_page_config(
    page_title=f"{APP_NAME} - Milk Analysis",
    page_icon="🧪",
    layout="wide",
)

apply_custom_theme()
render_sidebar()

loader = get_model_loader()
status_str = "Online & Ready" if loader.is_loaded else "Offline / Loading Error"

render_page_header(
    eyebrow="MILK QUALITY ANALYSIS",
    title="Analyze Milk Quality",
    subtitle="Enter the milk sample parameters below to predict its quality using our trained ML model.",
    badge_text=f"MODEL STATUS: {status_str}",
)

# Initialize Session State for results & form resets
if "prediction_result" not in st.session_state:
    st.session_state["prediction_result"] = None

col_form, col_guide = st.columns([1.8, 1.2])

with col_form:
    st.markdown(
        """
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background: #216B45; color: white; border-radius: 6px; padding: 2px 8px; font-size: 0.75rem; font-weight: 700;">01</span>
                <span style="font-size: 1.15rem; font-weight: 700; color: #26332B;">Sample Parameters</span>
            </div>
            <div style="font-size: 0.8rem; color: #6E7C73; margin-top: 2px;">
                All seven fields are strictly required for an accurate prediction.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.form("milk_analysis_form"):
        # Grid of inputs
        grid_c1, grid_c2 = st.columns(2)

        with grid_c1:
            val_ph = st.number_input(
                "pH Level (pH)",
                min_value=0.0,
                max_value=14.0,
                value=6.6,
                step=0.1,
                help="Acidity or alkalinity (pure fresh milk is typically 6.5–6.8)",
            )
            val_taste = st.selectbox(
                "Taste Assessment",
                options=["Acceptable / Optimal", "Unacceptable / Substandard"],
                index=0,
                help="Sensory taste assessment (1 = Optimal, 0 = Substandard)",
            )
            val_fat = st.selectbox(
                "Fat Content",
                options=["Present / Optimal", "Absent / Deficient"],
                index=0,
                help="Presence of expected fat content (1 = Present, 0 = Absent)",
            )
            val_color = st.number_input(
                "Color Value (RGB 0–255)",
                min_value=0,
                max_value=255,
                value=254,
                step=1,
                help="Photometric whiteness measurement (standard benchmark range: 240–255)",
            )

        with grid_c2:
            val_temp = st.number_input(
                "Temperature (°C)",
                min_value=0.0,
                max_value=100.0,
                value=37.0,
                step=0.5,
                help="Sample storage or dock temperature in Celsius (normal: 34–40°C)",
            )
            val_odor = st.selectbox(
                "Odor Assessment",
                options=["Normal / Fresh", "Abnormal / Sour"],
                index=0,
                help="Sensory odor assessment (1 = Fresh, 0 = Sour/Rancid)",
            )
            val_turbidity = st.selectbox(
                "Turbidity / Clarity",
                options=["Clear / Optimal", "Turbid / High Impurity"],
                index=0,
                help="Visual clarity and sediment scattering (0 = Clear, 1 = Turbid)",
            )
            inspector_notes = st.text_input(
                "Inspector Batch Notes (Optional)",
                value="",
                placeholder="e.g. Tank 4 morning delivery from supplier Alpha",
            )

        st.markdown("<div style='margin-top: 1rem;'></div>", unsafe_allow_html=True)
        btn_c1, btn_c2 = st.columns([1, 1])
        with btn_c1:
            submitted = st.form_submit_button("✨ Predict Milk Quality", use_container_width=True)
        with btn_c2:
            st.form_submit_button("Clear Form", use_container_width=True)

    if submitted:
        # Convert user labels to exact binary integers
        taste_int = 1 if "Acceptable" in val_taste else 0
        odor_int = 1 if "Normal" in val_odor else 0
        fat_int = 1 if "Present" in val_fat else 0
        turbidity_int = 1 if "Turbid" in val_turbidity else 0

        inputs_dict = {
            "pH": float(val_ph),
            "temperature": float(val_temp),
            "taste": taste_int,
            "odor": odor_int,
            "fat": fat_int,
            "turbidity": turbidity_int,
            "color": int(val_color),
        }

        try:
            with st.spinner("Executing Random Forest classification..."):
                result = predict_milk_sample(
                    inputs_dict,
                    save_to_db=True,
                    inspector_notes=inspector_notes,
                )
                st.session_state["prediction_result"] = result
                st.toast(f"Prediction generated: {result['predicted_label']} ({result['sample_id']})", icon="✅")
        except Exception as ex:
            st.error(f"Inference Error: {str(ex)}")

with col_guide:
    st.markdown(
        """
        <div class="mg-card">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 1.25rem;">🛡️</span>
                <span style="font-size: 1rem; font-weight: 700; color: #26332B;">Before you analyze</span>
            </div>
            <p style="font-size: 0.82rem; color: #6E7C73; line-height: 1.4;">
                For the most reliable result, use current measurements from a representative sample.
            </p>
            <div style="font-size: 0.82rem; color: #26332B;">
                <div style="margin-bottom: 6px;">✓ <strong>Calibrate measurement tools:</strong> Ensure pH electrodes and thermometers are calibrated within 24 hours.</div>
                <div style="margin-bottom: 6px;">✓ <strong>Use a fresh, mixed sample:</strong> Agitate the milk vessel to homogenize fat globules before testing.</div>
                <div>✓ <strong>Enter values accurately:</strong> Standard raw bovine milk ranges between pH 6.5–6.8 and 35–38°C.</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        f"""
        <div class="mg-notice-box">
            <span style="font-size: 1.25rem;">⚠️</span>
            <div>
                <div style="font-weight: 700; margin-bottom: 2px;">Important Notice</div>
                <div>{DISCLAIMER_TEXT}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------------------------------------------
# Prediction Result Section
# -------------------------------------------------------------
res = st.session_state.get("prediction_result")
if res:
    st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)
    st.markdown("### 📋 Prediction Result")

    status_class = res["status"]
    badge_bg = "#E8F5EC" if status_class == "success" else ("#FFF3DC" if status_class == "warning" else "#FAECEB")
    badge_color = res["color_hex"]
    status_icon = "🟢" if status_class == "success" else ("🟡" if status_class == "warning" else "🔴")

    st.markdown(
        f"""
        <div class="mg-result-card {status_class}">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <div style="font-size: 0.72rem; font-weight: 700; color: #6E7C73; letter-spacing: 0.08em; text-transform: uppercase;">
                        PREDICTION COMPLETE — {res['sample_id']}
                    </div>
                    <div style="font-size: 1.85rem; font-weight: 700; color: {badge_color}; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
                        <span>{status_icon}</span>
                        <span>{res['predicted_label']} Milk</span>
                    </div>
                    <div style="font-size: 0.88rem; color: #26332B; margin-top: 4px;">
                        {res['recommendation']}
                    </div>
                </div>
                <div style="background: {badge_bg}; border: 1px solid {badge_color}33; border-radius: 12px; padding: 12px 18px; text-align: center;">
                    <div style="font-size: 0.7rem; color: #6E7C73; text-transform: uppercase; font-weight: 700;">Model Confidence</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: {badge_color}; line-height: 1.1;">{res['confidence']}%</div>
                    <div style="font-size: 0.68rem; color: #6E7C73;">Random Forest Classifier</div>
                </div>
            </div>

            <div style="margin-top: 1.25rem; border-top: 1px solid #E4EAE6; padding-top: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #6E7C73; text-transform: uppercase; margin-bottom: 8px;">
                    Submitted Parameter Summary
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 0.82rem;">
                    <div><strong>pH:</strong> {res['parameters']['pH']}</div>
                    <div><strong>Temp:</strong> {res['parameters']['temperature']}°C</div>
                    <div><strong>Taste:</strong> {'Acceptable' if res['parameters']['taste'] == 1 else 'Unacceptable'}</div>
                    <div><strong>Odor:</strong> {'Normal' if res['parameters']['odor'] == 1 else 'Abnormal'}</div>
                    <div><strong>Fat:</strong> {'Present' if res['parameters']['fat'] == 1 else 'Absent'}</div>
                    <div><strong>Turbidity:</strong> {'Clear' if res['parameters']['turbidity'] == 0 else 'Turbid'}</div>
                    <div><strong>Color:</strong> {res['parameters']['color']} RGB</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    action_c1, action_c2, action_c3 = st.columns([1, 1, 2])
    with action_c1:
        if st.button("🔄 Analyze Another Sample", use_container_width=True):
            st.session_state["prediction_result"] = None
            st.rerun()

    with action_c2:
        # Download Sample Inspection Certificate HTML
        html_report = generate_single_sample_report_html({
            "sample_id": res["sample_id"],
            "created_at": res["created_at"],
            "ph": res["parameters"]["pH"],
            "temperature": res["parameters"]["temperature"],
            "taste": res["parameters"]["taste"],
            "odor": res["parameters"]["odor"],
            "fat": res["parameters"]["fat"],
            "turbidity": res["parameters"]["turbidity"],
            "color": res["parameters"]["color"],
            "predicted_quality": res["predicted_quality"],
            "predicted_label": res["predicted_label"],
            "confidence": res["confidence"],
            "inspector_name": res["inspector_name"],
            "inspector_notes": res.get("inspector_notes", ""),
        })
        st.download_button(
            label="📥 Download Certificate",
            data=html_report,
            file_name=f"MilkGuard_Certificate_{res['sample_id']}.html",
            mime="text/html",
            use_container_width=True,
        )

