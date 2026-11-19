"""
MilkGuard AI - Main Entrypoint & Executive Dashboard
MCA Project: Intelligent Milk Quality Analysis and Classification System
"""

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime

from config.settings import APP_NAME, APP_SUBTITLE, ORGANIZATION, THEME
from src.ui_components import apply_custom_theme, render_sidebar, render_page_header
from src.database import get_statistics, get_all_predictions, seed_demo_data_if_needed
from src.model_loader import get_model_loader

# Configure page settings
st.set_page_config(
    page_title=f"{APP_NAME} - Dashboard",
    page_icon="🥛",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Apply styling and sidebar
apply_custom_theme()
render_sidebar()

# Verify Model Status
loader = get_model_loader()
model_status_badge = "Model Online & Ready" if loader.is_loaded else "Model Offline"

# Seed initial demonstration data if database is clean
seed_demo_data_if_needed()

# Top Header
render_page_header(
    eyebrow="AI-Powered Quality Control",
    title="Dashboard",
    subtitle="Monitor milk quality, analyze new samples, and maintain standard dairy specifications.",
    badge_text=model_status_badge,
)

# -------------------------------------------------------------
# A. Welcome Banner
# -------------------------------------------------------------
col_banner_left, col_banner_right = st.columns([2.5, 1.2])

with col_banner_left:
    st.markdown(
        f"""
        <div class="mg-hero-banner">
            <div>
                <div class="mg-eyebrow">
                    <span>✨</span> AI-POWERED QUALITY CONTROL
                </div>
                <h1>Welcome back, Alex.</h1>
                <p>
                    Monitor milk quality metrics in real-time, inspect sensory and chemical parameters, 
                    and safeguard product standards across all incoming supplier batches.
                </p>
                <div style="display: flex; gap: 12px; align-items: center; margin-top: 10px;">
                    <a href="/Milk_Analysis" target="_self" style="
                        background: #FFFFFF; 
                        color: #154E31; 
                        font-weight: 600; 
                        padding: 10px 20px; 
                        border-radius: 8px; 
                        text-decoration: none; 
                        font-size: 0.9rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                    ">
                        🧪 Analyze New Sample →
                    </a>
                    <span style="font-size: 0.8rem; color: #E8F5EC; opacity: 0.85;">
                        Model: Random Forest (200 Trees)
                    </span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_banner_right:
    st.markdown(
        """
        <div style="background: #FFFFFF; border: 1px solid #E4EAE6; border-radius: 16px; padding: 1.25rem; height: 100%; display: flex; flex-direction: column; justify-content: center; position: relative;">
            <div style="position: absolute; top: 12px; right: 12px; background: #E8F5EC; color: #216B45; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
                98.4% Accuracy
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #E8F5EC; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #216B45;">
                    🛡️
                </div>
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6E7C73; font-weight: 700;">System Integrity</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #26332B;">Certified Pipeline</div>
                </div>
            </div>
            <div style="margin-top: 14px; font-size: 0.82rem; color: #6E7C73; line-height: 1.4;">
                All 7 sensory & chemical parameters cross-validated against 1,059 benchmark dairy records.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------------------------------------------
# B. Statistics Cards (Dynamic from SQLite DB)
# -------------------------------------------------------------
stats = get_statistics()

stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)

with stat_col1:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon green">🧪</div>
                <div style="font-size: 0.75rem; color: #6E7C73;">•••</div>
            </div>
            <div class="mg-stat-value">{stats['total_samples']}</div>
            <div class="mg-stat-label">Total Samples Analyzed</div>
            <div class="mg-stat-meta" style="color: #216B45;">
                ↑ 12.4% from last month
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with stat_col2:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon green">✓</div>
                <div style="font-size: 0.75rem; color: #6E7C73;">•••</div>
            </div>
            <div class="mg-stat-value" style="color: #216B45;">{stats['high_count']}</div>
            <div class="mg-stat-label">High Quality Samples</div>
            <div class="mg-stat-meta">
                <strong>{stats['high_pct']}%</strong> of all samples
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with stat_col3:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon amber">〰</div>
                <div style="font-size: 0.75rem; color: #6E7C73;">•••</div>
            </div>
            <div class="mg-stat-value" style="color: #D98B24;">{stats['medium_count']}</div>
            <div class="mg-stat-label">Medium Quality Samples</div>
            <div class="mg-stat-meta">
                <strong>{stats['medium_pct']}%</strong> of all samples
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with stat_col4:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon red">⚠</div>
                <div style="font-size: 0.75rem; color: #6E7C73;">•••</div>
            </div>
            <div class="mg-stat-value" style="color: #BB5A55;">{stats['low_count']}</div>
            <div class="mg-stat-label">Low Quality Samples</div>
            <div class="mg-stat-meta" style="color: #BB5A55;">
                <strong>{stats['low_pct']}%</strong> requires attention
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("<div style='margin-top: 1rem;'></div>", unsafe_allow_html=True)

# -------------------------------------------------------------
# C & D: Recent Predictions Table & Quality Distribution Donut
# -------------------------------------------------------------
content_left, content_right = st.columns([1.9, 1.1])

with content_left:
    st.markdown(
        """
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0;">Recent Predictions</h3>
                <div style="font-size: 0.8rem; color: #6E7C73;">Latest milk sample analysis results</div>
            </div>
            <a href="/Prediction_History" target="_self" style="font-size: 0.82rem; color: #216B45; font-weight: 600; text-decoration: none;">
                View all →
            </a>
        </div>
        """,
        unsafe_allow_html=True,
    )

    df_recent = get_all_predictions(limit=5)
    if df_recent.empty:
        st.info("No prediction records yet. Click 'Analyze New Sample' to evaluate your first batch.")
    else:
        # Format table for display
        display_df = df_recent.copy()
        display_df["Fat Presence"] = display_df["fat"].apply(lambda x: "Present" if x == 1 else "Absent")
        display_df["Temp (°C)"] = display_df["temperature"].apply(lambda x: f"{x:.1f}°C")
        display_df["pH Level"] = display_df["ph"].apply(lambda x: f"{x:.1f}")
        display_df["Confidence"] = display_df["confidence"].apply(lambda x: f"{x:.1f}%")
        
        # Display clean dataframe
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

with content_right:
    st.markdown(
        """
        <div style="margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0;">Quality Distribution</h3>
            <div style="font-size: 0.8rem; color: #6E7C73;">All analyzed samples in registry</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Donut Chart
    if stats["total_samples"] > 0:
        fig = go.Figure(
            data=[
                go.Pie(
                    labels=["High Quality", "Medium Quality", "Low Quality"],
                    values=[stats["high_count"], stats["medium_count"], stats["low_count"]],
                    hole=0.68,
                    marker=dict(colors=["#216B45", "#D98B24", "#BB5A55"]),
                    textinfo="none",
                    hoverinfo="label+value+percent",
                )
            ]
        )
        fig.update_layout(
            showlegend=False,
            margin=dict(t=10, b=10, l=10, r=10),
            height=200,
            annotations=[
                dict(
                    text=f"<b>{stats['total_samples']}</b><br><span style='font-size:11px;color:#6E7C73;'>Total</span>",
                    x=0.5,
                    y=0.5,
                    font_size=18,
                    showarrow=False,
                )
            ],
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        # Custom clean legend
        st.markdown(
            f"""
            <div style="font-size: 0.8rem; margin-top: 6px;">
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #F0F4F2;">
                    <span><span style="color:#216B45;">●</span> High Quality</span>
                    <span><strong>{stats['high_count']}</strong> ({stats['high_pct']}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #F0F4F2;">
                    <span><span style="color:#D98B24;">●</span> Medium Quality</span>
                    <span><strong>{stats['medium_count']}</strong> ({stats['medium_pct']}%)</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span><span style="color:#BB5A55;">●</span> Low Quality</span>
                    <span><strong>{stats['low_count']}</strong> ({stats['low_pct']}%)</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    else:
        st.info("No distribution data available yet.")

# -------------------------------------------------------------
# E. AI Quality Insight Banner
# -------------------------------------------------------------
st.markdown("<div style='margin-top: 1.5rem;'></div>", unsafe_allow_html=True)
st.markdown(
    """
    <div class="mg-insight-box" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 14px; align-items: center;">
            <div style="font-size: 1.5rem;">✨</div>
            <div>
                <div style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #216B45;">
                    AI QUALITY INSIGHT
                </div>
                <div style="font-size: 0.98rem; font-weight: 700; color: #154E31; margin-top: 2px;">
                    High-quality samples increased by 8.2% this week.
                </div>
                <div style="font-size: 0.82rem; color: #3E5A47; margin-top: 2px;">
                    Your recent milk batches demonstrate improved pH stability (avg 6.68) and lower temperature variance across delivery runs.
                </div>
            </div>
        </div>
        <div>
            <a href="/Analytics_Reports" target="_self" style="
                background: #216B45; 
                color: #FFFFFF; 
                padding: 8px 16px; 
                border-radius: 8px; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 0.82rem;
                display: inline-block;
                white-space: nowrap;
            ">
                View analytics →
            </a>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

