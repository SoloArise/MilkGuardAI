import React, { useState } from 'react';
import { IconSun, IconMoon, IconTrash, IconCheck, IconShield, IconAlert } from '../components/Icons';

interface SettingsPageProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  recordsCount?: number;
  onClearAllData?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  darkMode = false,
  onToggleDarkMode,
  recordsCount = 0,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'workspace' | 'notifications' | 'data'>('profile');
  const [fullName, setFullName] = useState('Alex Morgan');
  const [role, setRole] = useState('Quality Inspector');
  const [email, setEmail] = useState('alex@greenvalleydairy.com');
  const [workspace, setWorkspace] = useState('Green Valley Dairy');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [lowQualityAlerts, setLowQualityAlerts] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const confirmClearAll = () => {
    setShowClearModal(false);
    onClearAllData?.();
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          Page Header
          ------------------------------------------------------------- */}
      <div>
        <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
          PREFERENCES
        </div>
        <h2 className="text-2xl font-extrabold text-[#26332B] tracking-tight mt-0.5">
          Settings
        </h2>
        <p className="text-xs text-[#6E7C73] mt-0.5">
          Manage your workspace, theme appearance, and prediction data preferences.
        </p>
      </div>

      {/* -------------------------------------------------------------
          Two-Column Settings Layout
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#E8F5EC] text-[#216B45]'
                : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'appearance'
                ? 'bg-[#E8F5EC] text-[#216B45]'
                : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-white'
            }`}
          >
            Appearance & Dark Mode
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'workspace'
                ? 'bg-[#E8F5EC] text-[#216B45]'
                : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-white'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#E8F5EC] text-[#216B45]'
                : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'data'
                ? 'bg-[#FAECEB] text-[#BB5A55]'
                : 'text-[#6E7C73] hover:text-[#BB5A55] hover:bg-white'
            }`}
          >
            Data Management
          </button>
        </div>

        {/* Right Settings Form Card */}
        <div className="md:col-span-3 card-base p-6 sm:p-8">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                  Profile settings
                </h3>
                <p className="text-xs text-[#6E7C73] mt-0.5">
                  Update your personal inspector identity and designated role.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-[#E4EAE6]">
                  <div className="w-16 h-16 rounded-full bg-[#216B45] text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-[#E8F5EC]">
                    AR
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-[#E4EAE6] bg-white text-xs font-bold text-[#26332B] hover:bg-[#F8FAF8] transition-colors"
                    >
                      Change photo
                    </button>
                    <div className="text-[11px] text-[#6E7C73] mt-1">
                      JPG or PNG, max 2 MB
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#26332B] mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26332B] mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26332B] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26332B] mb-1">
                      Workspace
                    </label>
                    <input
                      type="text"
                      value={workspace}
                      onChange={(e) => setWorkspace(e.target.value)}
                      className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4EAE6] flex items-center justify-between">
                  {savedMessage ? (
                    <span className="text-xs font-bold text-[#216B45]">
                      ✓ Preferences saved successfully.
                    </span>
                  ) : (
                    <span className="text-xs text-[#6E7C73]">
                      All changes take effect immediately.
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-all shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: APPEARANCE & DARK MODE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                  Appearance & Dark Mode
                </h3>
                <p className="text-xs text-[#6E7C73] mt-0.5">
                  Select your preferred interface display theme.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Theme Card */}
                <div
                  onClick={() => {
                    if (darkMode) onToggleDarkMode?.();
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    !darkMode
                      ? 'border-[#216B45] bg-[#E8F5EC]/40 shadow-xs'
                      : 'border-[#E4EAE6] bg-white hover:border-[#D1DBD5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E4EAE6] text-[#216B45] flex items-center justify-center shadow-xs">
                      <IconSun size={20} />
                    </div>
                    {!darkMode && (
                      <span className="w-6 h-6 rounded-full bg-[#216B45] text-white flex items-center justify-center text-xs">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#26332B]">Light Mode</div>
                  <p className="text-xs text-[#6E7C73] mt-1">
                    Clean, forest-green dairy SaaS theme optimized for day testing.
                  </p>
                </div>

                {/* Dark Theme Card */}
                <div
                  onClick={() => {
                    if (!darkMode) onToggleDarkMode?.();
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    darkMode
                      ? 'border-[#216B45] bg-[#18241E] shadow-xs'
                      : 'border-[#E4EAE6] bg-white hover:border-[#D1DBD5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#121B16] border border-[#23352B] text-[#A5D6A7] flex items-center justify-center shadow-xs">
                      <IconMoon size={20} />
                    </div>
                    {darkMode && (
                      <span className="w-6 h-6 rounded-full bg-[#216B45] text-white flex items-center justify-center text-xs">
                        <IconCheck size={14} />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#26332B]">Dark Mode</div>
                  <p className="text-xs text-[#6E7C73] mt-1">
                    Deep forest-black theme that reduces eye strain in low-light labs.
                  </p>
                </div>
              </div>

              {/* Quick toggle row */}
              <div className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#26332B]">Active Dark Mode</div>
                  <div className="text-[11px] text-[#6E7C73] mt-0.5">
                    Toggle dark mode dynamically across all application pages.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    darkMode ? 'bg-[#216B45]' : 'bg-[#E4EAE6]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSPACE */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                  Workspace Details
                </h3>
                <p className="text-xs text-[#6E7C73] mt-0.5">
                  Collection facility and model runtime environment.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex justify-between items-center">
                  <span className="font-semibold text-[#6E7C73]">Workspace Name</span>
                  <span className="font-bold text-[#26332B]">{workspace}</span>
                </div>
                <div className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex justify-between items-center">
                  <span className="font-semibold text-[#6E7C73]">ML Model Algorithm</span>
                  <span className="font-bold text-[#216B45]">Random Forest Classifier (200 Trees)</span>
                </div>
                <div className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex justify-between items-center">
                  <span className="font-semibold text-[#6E7C73]">Storage Engine</span>
                  <span className="font-bold text-[#26332B]">SQLite (WAL Mode)</span>
                </div>
                <div className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex justify-between items-center">
                  <span className="font-semibold text-[#6E7C73]">Supervision</span>
                  <span className="font-bold text-[#26332B]">Dr. S.C. Dimri (Graphic Era University)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                  Alert & Notification Preferences
                </h3>
                <p className="text-xs text-[#6E7C73] mt-0.5">
                  Configure real-time quality alerts and summary delivery.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8]">
                  <div>
                    <div className="text-xs font-bold text-[#26332B]">Email notifications</div>
                    <div className="text-[11px] text-[#6E7C73] mt-0.5">
                      Receive weekly dairy quality summaries.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifs(!emailNotifs)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      emailNotifs ? 'bg-[#216B45]' : 'bg-[#E4EAE6]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        emailNotifs ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8]">
                  <div>
                    <div className="text-xs font-bold text-[#26332B]">Low quality alerts</div>
                    <div className="text-[11px] text-[#6E7C73] mt-0.5">
                      Immediate alert when a sample is classified as Low Quality.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLowQualityAlerts(!lowQualityAlerts)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      lowQualityAlerts ? 'bg-[#216B45]' : 'bg-[#E4EAE6]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        lowQualityAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA MANAGEMENT (CLEAR ALL DATA) */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#BB5A55] tracking-tight">
                  Data Management & Danger Zone
                </h3>
                <p className="text-xs text-[#6E7C73] mt-0.5">
                  Manage persistent records and clear historical prediction records.
                </p>
              </div>

              {clearedSuccess && (
                <div className="p-4 rounded-xl bg-[#E8F5EC] border border-[#C3E2CD] text-xs font-bold text-[#216B45]">
                  ✓ All sample predictions and history have been successfully cleared.
                </div>
              )}

              <div className="p-5 rounded-2xl border border-[#FAECEB] bg-[#FAECEB]/40 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAECEB] text-[#BB5A55] flex items-center justify-center shrink-0">
                    <IconTrash size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#26332B]">Clear All Historical Data</div>
                    <div className="text-xs text-[#6E7C73] mt-1 leading-relaxed">
                      Permanently wipes all sample predictions, confidence scores, and inspector notes from the SQLite database.
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EBC6C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#6E7C73]">
                    Currently stored: <strong className="text-[#26332B]">{recordsCount}</strong> record(s)
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#BB5A55] hover:bg-[#A34B46] text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Data */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card-base p-6 max-w-md w-full bg-white space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#FAECEB] text-[#BB5A55] flex items-center justify-center mx-auto">
              <IconTrash size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#26332B]">Permanently Clear All Data?</h3>
              <p className="text-xs text-[#6E7C73] mt-1.5 leading-relaxed">
                This will delete all historical records from the SQLite database and reset dashboard counters to zero. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E4EAE6] text-xs font-semibold text-[#6E7C73] hover:text-[#26332B] hover:bg-[#F8FAF8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2 rounded-xl bg-[#BB5A55] hover:bg-[#A34B46] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
