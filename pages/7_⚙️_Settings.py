"""
MilkGuard AI - Settings & Workspace Preferences
Inspector profile configuration, workspace details, notification thresholds, and security preferences.
"""

import streamlit as st
from config.settings import APP_NAME, ORGANIZATION
from src.ui_components import apply_custom_theme, render_sidebar, render_page_header
from src.database import clear_all_predictions, get_statistics

# Page Setup
st.set_page_config(
    page_title=f"{APP_NAME} - Settings",
    page_icon="⚙️",
    layout="wide",
)

apply_custom_theme()
render_sidebar()

render_page_header(
    eyebrow="PREFERENCES",
    title="Settings",
    subtitle="Manage your operational workspace, inspector identity, and alert notification preferences.",
)

col_nav, col_content = st.columns([1, 2.5])

with col_nav:
    st.markdown(
        """
        <div class="mg-card" style="padding: 0.75rem;">
            <div style="background: #E8F5EC; color: #216B45; font-weight: 600; padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; font-size: 0.88rem; display: flex; align-items: center; gap: 8px; border-left: 3px solid #216B45;">
                👤 Profile Settings
            </div>
            <div style="color: #6E7C73; padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; font-size: 0.88rem; cursor: pointer;">
                🏢 Workspace Details
            </div>
            <div style="color: #6E7C73; padding: 10px 14px; border-radius: 8px; margin-bottom: 4px; font-size: 0.88rem; cursor: pointer;">
                🔔 Alerts & Notifications
            </div>
            <div style="color: #6E7C73; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; cursor: pointer;">
                🔒 Security & Compliance
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_content:
    st.markdown(
        """
        <div class="mg-card">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #26332B; margin: 0 0 4px 0;">Profile Settings</h3>
            <div style="font-size: 0.82rem; color: #6E7C73; margin-bottom: 1.25rem;">
                Update your active inspector identity and automated quality summary alerts.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.form("settings_form"):
        # Avatar representation
        st.markdown(
            """
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #216B45; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 700; box-shadow: 0 4px 12px rgba(33, 107, 69, 0.2);">
                    AR
                </div>
                <div>
                    <div style="font-size: 0.95rem; font-weight: 600; color: #26332B;">Inspector Photo</div>
                    <div style="font-size: 0.78rem; color: #6E7C73;">JPG, GIF or PNG. Max size 2MB</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        f_c1, f_c2 = st.columns(2)
        with f_c1:
            name_val = st.text_input("Full Name", value="Alex Morgan")
            email_val = st.text_input("Email Address", value="alex@greenvalleydairy.com")
        with f_c2:
            role_val = st.text_input("Role / Designation", value="Quality Inspector")
            workspace_val = st.text_input("Active Workspace", value=ORGANIZATION)

        st.markdown("---")
        st.markdown("#### Notification Preferences")
        toggle_email = st.checkbox("Email notifications (Receive weekly quality summary reports)", value=True)
        toggle_alert = st.checkbox("Low quality alerts (Immediate push notification when low quality batch is detected)", value=True)

        st.markdown("<div style='margin-top: 1rem;'></div>", unsafe_allow_html=True)
        saved = st.form_submit_button("Save Changes")
        if saved:
            st.toast("Settings updated successfully!", icon="✅")
            st.success("Inspector preferences saved.")

    # Data Management Card
    st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)
    st.markdown(
        """
        <div class="mg-card" style="border-color: #FAECEB;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #BB5A55; margin: 0 0 4px 0;">Data Management & Danger Zone</h3>
            <div style="font-size: 0.82rem; color: #6E7C73; margin-bottom: 1rem;">
                Manage stored database records and operational prediction history.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    stats = get_statistics()
    st.write(f"Currently stored records in database: **{stats['total_samples']}**")
    confirm_clear = st.checkbox("I confirm that I want to delete all historical prediction data.", key="settings_confirm_clear")
    if st.button("🗑️ Clear All Historical Data", type="primary", disabled=not confirm_clear):
        deleted = clear_all_predictions()
        st.toast(f"Deleted {deleted} records from database.", icon="🗑️")
        st.success("All prediction records have been cleared.")
        st.rerun()

