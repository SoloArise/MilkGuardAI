"""
MilkGuard AI - Shared Streamlit UI Components & Layout Helpers
Ensures consistent B2B SaaS navigation, sidebar branding, profile cards, and CSS injection.
"""

import streamlit as st
from config.settings import (
    APP_NAME,
    APP_SUBTITLE,
    ORGANIZATION,
    MODEL_VERSION,
    ASSETS_DIR,
)


def apply_custom_theme():
    """Injects custom CSS and typography into the active Streamlit page."""
    css_file = ASSETS_DIR / "custom.css"
    if css_file.exists():
        with open(css_file, "r", encoding="utf-8") as f:
            css_content = f.read()
        st.markdown(f"<style>{css_content}</style>", unsafe_allow_html=True)

    if st.session_state.get("st_dark_mode", False):
        dark_css = """
        <style>
        :root {
            --background: #0E1612 !important;
            --card-bg: #15221B !important;
            --border: #23372C !important;
            --text-main: #E2EDE6 !important;
            --text-muted: #93A69C !important;
            --secondary: #162B20 !important;
        }
        .stApp, [data-testid="stAppViewContainer"], header[data-testid="stHeader"] {
            background-color: #0E1612 !important;
            color: #E2EDE6 !important;
        }
        section[data-testid="stSidebar"] {
            background-color: #111B15 !important;
            border-right: 1px solid #23372C !important;
        }
        .mg-card {
            background: #15221B !important;
            border-color: #23372C !important;
            color: #E2EDE6 !important;
        }
        .mg-result-card {
            background: #15221B !important;
            border-color: #23372C !important;
            color: #E2EDE6 !important;
        }
        div[data-baseweb="input"], div[data-baseweb="select"] {
            background-color: #18271F !important;
            border-color: #273E32 !important;
            color: #E2EDE6 !important;
        }
        input, select, textarea {
            color: #E2EDE6 !important;
        }
        p, span, label, h1, h2, h3, h4 {
            color: #E2EDE6;
        }
        </style>
        """
        st.markdown(dark_css, unsafe_allow_html=True)


def render_sidebar():
    """Renders the standard MilkGuard AI sidebar across all pages."""
    with st.sidebar:
        # Brand Logo and Title
        st.markdown(
            f"""
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #216B45; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(33, 107, 69, 0.25);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                </div>
                <div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #26332B; line-height: 1.1; letter-spacing: -0.02em;">
                        MilkGuard <span style="color: #216B45;">AI</span>
                    </div>
                    <div style="font-size: 0.72rem; color: #6E7C73; font-weight: 500;">Intelligent Quality System</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Workspace Card
        st.markdown(
            f"""
            <div style="background: #F8FAF8; border: 1px solid #E4EAE6; border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 28px; height: 28px; border-radius: 6px; background: #E8F5EC; color: #216B45; font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">
                        MG
                    </div>
                    <div>
                        <div style="font-size: 0.65rem; color: #6E7C73; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Workspace</div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: #26332B;">{ORGANIZATION}</div>
                    </div>
                </div>
                <div style="color: #6E7C73; font-size: 0.8rem;">▾</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Quick Dark Mode Toggle
        st.toggle("🌙 Dark Mode", key="st_dark_mode")

        st.caption(f"System Version: {MODEL_VERSION} (Production)")

        # Divider and bottom inspector profile
        st.markdown("---")
        st.markdown(
            """
            <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #216B45; color: #FFFFFF; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;">
                    AR
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 0.88rem; font-weight: 600; color: #26332B; line-height: 1.1;">Alex Morgan</div>
                    <div style="font-size: 0.72rem; color: #6E7C73;">Quality Inspector</div>
                </div>
                <div style="color: #6E7C73; font-size: 0.8rem; cursor: pointer;">•••</div>
            </div>
            """,
            unsafe_allow_html=True,
        )


def render_page_header(eyebrow: str, title: str, subtitle: str, badge_text: str = None):
    """Renders consistent top breadcrumb / page header."""
    badge_html = ""
    if badge_text:
        badge_html = f"""
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #E8F5EC; border: 1px solid #C3E2CD; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #216B45;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #216B45; display: inline-block;"></span>
            {badge_text}
        </div>
        """

    st.markdown(
        f"""
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div>
                <div style="font-size: 0.75rem; font-weight: 700; color: #216B45; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                    {eyebrow}
                </div>
                <h1 style="font-size: 1.75rem; font-weight: 700; color: #26332B; margin: 0; letter-spacing: -0.02em;">
                    {title}
                </h1>
                <p style="font-size: 0.9rem; color: #6E7C73; margin: 4px 0 0 0;">
                    {subtitle}
                </p>
            </div>
            <div>
                {badge_html}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

