import React, { useState, useEffect } from 'react';
import { Page, StatsData, PredictionRecord, PredictionResult } from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { RecordModal } from './components/RecordModal';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelTrainingPage } from './pages/ModelTrainingPage';
import { AboutModelPage } from './pages/AboutModelPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<PredictionRecord | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('milkguard_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('milkguard_dark_mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Initial Benchmark Stats from Prompt: 2,847 Total, 1,624 High (57%), 846 Medium (29.7%), 377 Low (13.3%)
  const [stats, setStats] = useState<StatsData>({
    total_samples: 2847,
    high_count: 1624,
    high_pct: 57.0,
    medium_count: 846,
    medium_pct: 29.7,
    low_count: 377,
    low_pct: 13.3,
    avg_confidence: 94.2,
    pass_rate: 86.7,
  });

  // Initial Benchmark Sample Records from prompt specifications:
  // MG-2841, MG-2840, MG-2839, MG-2838, MG-2837, MG-2836, MG-2835
  const [records, setRecords] = useState<PredictionRecord[]>([
    {
      sample_id: 'MG-2841',
      created_at: 'May 24, 2026 10:42 AM',
      ph: 6.7,
      temperature: 36.4,
      taste: 1,
      odor: 1,
      fat: 1,
      turbidity: 0,
      color: 254,
      predicted_quality: 'high',
      predicted_label: 'High Quality',
      confidence: 96.8,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Morning tank batch A. Optimal freshness.',
    },
    {
      sample_id: 'MG-2840',
      created_at: 'May 24, 2026 09:18 AM',
      ph: 6.4,
      temperature: 38.1,
      taste: 1,
      odor: 0,
      fat: 1,
      turbidity: 1,
      color: 252,
      predicted_quality: 'medium',
      predicted_label: 'Medium Quality',
      confidence: 88.5,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Slight temperature elevation upon intake.',
    },
    {
      sample_id: 'MG-2839',
      created_at: 'May 23, 2026 04:36 PM',
      ph: 5.9,
      temperature: 41.2,
      taste: 0,
      odor: 0,
      fat: 0,
      turbidity: 1,
      color: 242,
      predicted_quality: 'low',
      predicted_label: 'Low Quality',
      confidence: 94.2,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Substandard acidity. Rejected at dock.',
    },
    {
      sample_id: 'MG-2838',
      created_at: 'May 23, 2026 02:11 PM',
      ph: 6.8,
      temperature: 35.8,
      taste: 1,
      odor: 1,
      fat: 1,
      turbidity: 0,
      color: 255,
      predicted_quality: 'high',
      predicted_label: 'High Quality',
      confidence: 98.4,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Grade A benchmark collection.',
    },
    {
      sample_id: 'MG-2837',
      created_at: 'May 22, 2026 11:52 AM',
      ph: 6.5,
      temperature: 37.4,
      taste: 1,
      odor: 1,
      fat: 1,
      turbidity: 1,
      color: 250,
      predicted_quality: 'medium',
      predicted_label: 'Medium Quality',
      confidence: 85.0,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Approved for secondary cheese blending.',
    },
    {
      sample_id: 'MG-2836',
      created_at: 'May 21, 2026 08:30 AM',
      ph: 6.6,
      temperature: 36.0,
      taste: 1,
      odor: 1,
      fat: 1,
      turbidity: 0,
      color: 253,
      predicted_quality: 'high',
      predicted_label: 'High Quality',
      confidence: 97.1,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Standard morning intake.',
    },
    {
      sample_id: 'MG-2835',
      created_at: 'May 20, 2026 05:15 PM',
      ph: 4.8,
      temperature: 45.0,
      taste: 0,
      odor: 0,
      fat: 0,
      turbidity: 1,
      color: 240,
      predicted_quality: 'low',
      predicted_label: 'Low Quality',
      confidence: 98.9,
      inspector_name: 'Alex Morgan',
      inspector_notes: 'Spoiled raw sample. Quarantined.',
    },
  ]);

  // Attempt to load from live API backend if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/statistics');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.total_samples > 0) {
            setStats(statsData);
          }
        }

        const predsRes = await fetch('/api/predictions?limit=50');
        if (predsRes.ok) {
          const predsData = await predsRes.json();
          if (Array.isArray(predsData) && predsData.length > 0) {
            setRecords(predsData);
          }
        }
      } catch (e) {
        // Fallback data remains active
      }
    };
    fetchData();
  }, []);

  const handlePredictionComplete = (result: PredictionResult) => {
    // Add new prediction to local records state
    const newRecord: PredictionRecord = {
      sample_id: result.sample_id,
      created_at: result.created_at,
      ph: result.parameters.pH,
      temperature: result.parameters.temperature,
      taste: result.parameters.taste,
      odor: result.parameters.odor,
      fat: result.parameters.fat,
      turbidity: result.parameters.turbidity,
      color: result.parameters.color,
      predicted_quality: result.predicted_quality,
      predicted_label: result.predicted_label,
      confidence: result.confidence,
      proba_high: result.probabilities.high,
      proba_medium: result.probabilities.medium,
      proba_low: result.probabilities.low,
      inspector_name: result.inspector_name,
      inspector_notes: result.disclaimer,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Update dynamic stats
    setStats((prev) => {
      const nextTotal = prev.total_samples + 1;
      const nextHigh = prev.high_count + (result.predicted_quality === 'high' ? 1 : 0);
      const nextMed = prev.medium_count + (result.predicted_quality === 'medium' ? 1 : 0);
      const nextLow = prev.low_count + (result.predicted_quality === 'low' ? 1 : 0);
      return {
        ...prev,
        total_samples: nextTotal,
        high_count: nextHigh,
        high_pct: Math.round((nextHigh / nextTotal) * 1000) / 10,
        medium_count: nextMed,
        medium_pct: Math.round((nextMed / nextTotal) * 1000) / 10,
        low_count: nextLow,
        low_pct: Math.round((nextLow / nextTotal) * 1000) / 10,
        pass_rate: Math.round(((nextHigh + nextMed) / nextTotal) * 1000) / 10,
      };
    });
  };

  const handleExportCSV = () => {
    window.open('/api/reports/csv', '_blank');
  };

  const handleDownloadBatchReport = () => {
    window.open('/api/reports/batch', '_blank');
  };

  const handleClearAllData = async () => {
    try {
      await fetch('/api/predictions', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear database on server', e);
    }
    setRecords([]);
    setStats({
      total_samples: 0,
      high_count: 0,
      high_pct: 0,
      medium_count: 0,
      medium_pct: 0,
      low_count: 0,
      low_pct: 0,
      avg_confidence: 0,
      pass_rate: 0,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        historyCount={records.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Top Navigation */}
        <TopNav
          currentPage={currentPage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              stats={stats}
              recentPredictions={records.filter(
                (r) =>
                  !searchQuery ||
                  r.sample_id.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onNavigate={setCurrentPage}
              onViewRecord={setSelectedRecord}
            />
          )}

          {currentPage === 'analysis' && (
            <AnalysisPage
              onPredictionComplete={handlePredictionComplete}
              onNavigateHistory={() => setCurrentPage('history')}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              records={records}
              onViewRecord={setSelectedRecord}
              onExportCSV={handleExportCSV}
              onClearAllData={handleClearAllData}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsPage
              stats={stats}
              onDownloadReport={handleDownloadBatchReport}
            />
          )}

          {currentPage === 'training' && <ModelTrainingPage />}

          {currentPage === 'about' && <AboutModelPage />}

          {currentPage === 'settings' && (
            <SettingsPage
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              recordsCount={records.length}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#E4EAE6] py-4 px-6 text-center text-xs text-[#6E7C73] bg-[#F8FAF8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-[1500px] mx-auto">
            <span>
              <strong>MilkGuard AI</strong> — MCA Artificial Intelligence & Data Science Academic Project
            </span>
            <span>Department of Computer Applications • Graphic Era (Deemed to be University)</span>
          </div>
        </footer>
      </div>

      {/* Detail Inspector Modal */}
      <RecordModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};
export default App;

