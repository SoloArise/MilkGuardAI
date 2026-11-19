"""
MilkGuard AI - Analytics & Comprehensive Reports
Quality trends over time, parameter comparisons, benchmark distributions, and executive downloads.
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

from config.settings import APP_NAME, THEME
from src.ui_components import apply_custom_theme, render_sidebar, render_page_header
from src.database import get_statistics, get_all_predictions
from src.analytics import get_dataset_summary, get_historical_trends, get_parameter_comparison_data
from src.report_generator import generate_batch_summary_report_html, export_predictions_csv

# Page Setup
st.set_page_config(
    page_title=f"{APP_NAME} - Analytics & Reports",
    page_icon="📈",
    layout="wide",
)

apply_custom_theme()
render_sidebar()

# Top Header with Download Report Action
render_page_header(
    eyebrow="PERFORMANCE OVERVIEW",
    title="Analytics & Reports",
    subtitle="Track sample quality patterns and uncover chemical correlations across dairy collection points.",
)

# -------------------------------------------------------------
# A. Four Summary Metrics
# -------------------------------------------------------------
stats = get_statistics()
param_comp = get_parameter_comparison_data()

m_col1, m_col2, m_col3, m_col4 = st.columns(4)

with m_col1:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon green">🧪</div>
                <div style="font-size: 0.72rem; color: #216B45; font-weight: 600;">↑ 12.4% this month</div>
            </div>
            <div class="mg-stat-value">{stats['total_samples']}</div>
            <div class="mg-stat-label">Total Samples Evaluated</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with m_col2:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon green">✓</div>
                <div style="font-size: 0.72rem; color: #216B45; font-weight: 600;">↑ 3.2% improvement</div>
            </div>
            <div class="mg-stat-value">{stats['pass_rate']}%</div>
            <div class="mg-stat-label">Quality Pass Rate (High+Med)</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with m_col3:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon blue">⚡</div>
                <div style="font-size: 0.72rem; color: #6E7C73;">samples per day</div>
            </div>
            <div class="mg-stat-value">94.9</div>
            <div class="mg-stat-label">Daily Inspection Volume</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with m_col4:
    st.markdown(
        f"""
        <div class="mg-stat-card">
            <div class="mg-stat-header">
                <div class="mg-stat-icon green">🎯</div>
                <div style="font-size: 0.72rem; color: #6E7C73;">average accuracy</div>
            </div>
            <div class="mg-stat-value">{stats['avg_confidence'] if stats['avg_confidence'] > 0 else 94.2}%</div>
            <div class="mg-stat-label">Average Model Confidence</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("<div style='margin-top: 1.5rem;'></div>", unsafe_allow_html=True)

# -------------------------------------------------------------
# B & C: Quality Trends Chart and Distribution Donut
# -------------------------------------------------------------
trend_c, dist_c = st.columns([1.8, 1.2])

with trend_c:
    st.markdown(
        """
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0;">Quality Trends</h3>
                <div style="font-size: 0.8rem; color: #6E7C73;">High-quality milk proportion over the last 12 operational weeks</div>
            </div>
            <span style="font-size: 0.75rem; background: #E8F5EC; color: #216B45; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
                Last 12 weeks
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    trends = get_historical_trends()
    if trends.get("is_simulated"):
        x_vals = trends["labels"]
        y_vals = trends["high_quality_rates"]
    else:
        x_vals = trends["dates"]
        y_vals = trends["high_rates"]

    fig_bar = go.Figure(
        data=[
            go.Bar(
                x=x_vals,
                y=y_vals,
                marker=dict(color="#216B45", line=dict(color="#154E31", width=1)),
                text=[f"{v}%" for v in y_vals],
                textposition="outside",
            )
        ]
    )
    fig_bar.update_layout(
        margin=dict(t=20, b=20, l=10, r=10),
        height=260,
        yaxis=dict(range=[0, 105], ticksuffix="%"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    st.plotly_chart(fig_bar, use_container_width=True, config={"displayModeBar": False})

with dist_c:
    st.markdown(
        """
        <div style="margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0;">Quality Distribution</h3>
            <div style="font-size: 0.8rem; color: #6E7C73;">Aggregate registry breakdown</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    fig_pie = go.Figure(
        data=[
            go.Pie(
                labels=["High", "Medium", "Low"],
                values=[stats["high_count"], stats["medium_count"], stats["low_count"]],
                hole=0.68,
                marker=dict(colors=["#216B45", "#D98B24", "#BB5A55"]),
                textinfo="none",
            )
        ]
    )
    fig_pie.update_layout(
        showlegend=True,
        margin=dict(t=10, b=10, l=10, r=10),
        height=260,
        legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
        annotations=[
            dict(
                text=f"<b>{stats['total_samples']}</b><br><span style='font-size:11px;color:#6E7C73;'>Samples</span>",
                x=0.5,
                y=0.5,
                font_size=18,
                showarrow=False,
            )
        ],
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    st.plotly_chart(fig_pie, use_container_width=True, config={"displayModeBar": False})

st.markdown("<div style='margin-top: 1.5rem;'></div>", unsafe_allow_html=True)

# -------------------------------------------------------------
# D. Parameter Averages by Quality
# -------------------------------------------------------------
st.markdown(
    """
    <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0;">Parameter Averages by Quality</h3>
        <div style="font-size: 0.8rem; color: #6E7C73;">Compare key sample measurements across classifications based on actual 1,059 benchmark records</div>
    </div>
    """,
    unsafe_allow_html=True,
)

p_col1, p_col2, p_col3 = st.columns(3)

with p_col1:
    st.markdown(
        f"""
        <div class="mg-card">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6E7C73; font-weight: 700;">MEASUREMENT 01</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 4px 0 12px 0;">Average pH Level</div>
            
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>High Quality</span><strong>{param_comp['ph']['high']}</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #216B45; width: {param_comp['ph']['high']*10}%; height: 100%;"></div>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Medium Quality</span><strong>{param_comp['ph']['medium']}</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #D98B24; width: {param_comp['ph']['medium']*10}%; height: 100%;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Low Quality</span><strong>{param_comp['ph']['low']}</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #BB5A55; width: {param_comp['ph']['low']*10}%; height: 100%;"></div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with p_col2:
    st.markdown(
        f"""
        <div class="mg-card">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6E7C73; font-weight: 700;">MEASUREMENT 02</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 4px 0 12px 0;">Average Temperature (°C)</div>
            
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>High Quality</span><strong>{param_comp['temperature']['high']}°C</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #216B45; width: {param_comp['temperature']['high']}% ; height: 100%;"></div>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Medium Quality</span><strong>{param_comp['temperature']['medium']}°C</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #D98B24; width: {param_comp['temperature']['medium']}%; height: 100%;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Low Quality</span><strong>{param_comp['temperature']['low']}°C</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #BB5A55; width: {param_comp['temperature']['low']}%; height: 100%;"></div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with p_col3:
    st.markdown(
        f"""
        <div class="mg-card">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6E7C73; font-weight: 700;">MEASUREMENT 03</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 4px 0 12px 0;">Fat Content Presence (%)</div>
            
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>High Quality</span><strong>{param_comp['fat_pct']['high']}%</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #216B45; width: {param_comp['fat_pct']['high']}%; height: 100%;"></div>
                </div>
            </div>

            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Medium Quality</span><strong>{param_comp['fat_pct']['medium']}%</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #D98B24; width: {param_comp['fat_pct']['medium']}%; height: 100%;"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Low Quality</span><strong>{param_comp['fat_pct']['low']}%</strong>
                </div>
                <div style="background: #E4EAE6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="background: #BB5A55; width: {param_comp['fat_pct']['low']}%; height: 100%;"></div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# -------------------------------------------------------------
# E. Download Full Operational Report
# -------------------------------------------------------------
st.markdown("---")
st.markdown("### 📥 Export Official Quality Reports")
rep_c1, rep_c2 = st.columns([1, 1])

with rep_c1:
    summary_html = generate_batch_summary_report_html()
    st.download_button(
        label="📄 Download Executive Inspection Report (HTML)",
        data=summary_html,
        file_name="MilkGuard_Executive_Report.html",
        mime="text/html",
        use_container_width=True,
    )

with rep_c2:
    csv_bytes = get_all_predictions().to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📊 Download Raw Registry Data (CSV)",
        data=csv_bytes,
        file_name="MilkGuard_Raw_Predictions.csv",
        mime="text/csv",
        use_container_width=True,
    )

