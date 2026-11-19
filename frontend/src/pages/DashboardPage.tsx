import React from 'react';
import { Page, StatsData, PredictionRecord } from '../types';
import {
  IconFlask,
  IconCheck,
  IconTrend,
  IconAlert,
  IconSparkle,
  IconEye,
  IconMore,
  IconMilkDrop,
} from '../components/Icons';

interface DashboardPageProps {
  stats: StatsData;
  recentPredictions: PredictionRecord[];
  onNavigate: (page: Page) => void;
  onViewRecord: (record: PredictionRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentPredictions,
  onNavigate,
  onViewRecord,
}) => {
  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          A. Welcome Hero Banner
          ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#154E31] via-[#1A5C3A] to-[#216B45] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold tracking-wider text-[#A5D6A7] uppercase">
              <IconSparkle size={13} className="text-[#A5D6A7]" />
              <span>AI-POWERED QUALITY CONTROL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#E8F5EC]/90 leading-relaxed font-normal">
              Monitor milk quality, analyze new samples, and keep your dairy production standards high.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('analysis')}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-[#154E31] text-xs font-bold shadow-md hover:bg-[#E8F5EC] transition-all transform active:scale-95"
              >
                <IconFlask size={16} className="text-[#216B45]" />
                <span>Analyze New Sample</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>

          {/* Right Non-Cartoon Abstract Dairy Visual */}
          <div className="relative hidden lg:flex items-center justify-center w-64 h-40">
            {/* Concentric faint orbital lines */}
            <div className="absolute w-36 h-36 rounded-full border border-white/15 animate-pulse" />
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-white/10" />

            {/* Central Milk Drop Mark */}
            <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <IconMilkDrop size={40} className="text-white drop-shadow" />
            </div>

            {/* Floating Translucent Information Pills */}
            <div className="absolute -top-1 left-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white shadow-sm">
              ✓ Quality checked
            </div>
            <div className="absolute -bottom-1 right-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-[#A5D6A7] shadow-sm">
              98.4% accuracy
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          B. Four Statistics Cards
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Samples */}
        <div className="card-base p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#216B45] flex items-center justify-center">
              <IconFlask size={20} />
            </div>
            <IconMore size={16} className="text-[#6E7C73] cursor-pointer hover:text-[#26332B]" />
          </div>
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            TOTAL SAMPLES
          </div>
          <div className="text-2xl font-extrabold text-[#26332B] mt-0.5 tracking-tight">
            {stats.total_samples.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#216B45] mt-2">
            <span>↑ 12.4%</span>
            <span className="text-[#6E7C73] font-normal">from last month</span>
          </div>
        </div>

        {/* Card 2: High Quality */}
        <div className="card-base p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#216B45] flex items-center justify-center">
              <IconCheck size={20} />
            </div>
            <IconMore size={16} className="text-[#6E7C73] cursor-pointer hover:text-[#26332B]" />
          </div>
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            HIGH QUALITY
          </div>
          <div className="text-2xl font-extrabold text-[#216B45] mt-0.5 tracking-tight">
            {stats.high_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26332B] mt-2">
            <span>{stats.high_pct}%</span>
            <span className="text-[#6E7C73] font-normal">of all samples</span>
          </div>
        </div>

        {/* Card 3: Medium Quality */}
        <div className="card-base p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3DC] text-[#D98B24] flex items-center justify-center">
              <IconTrend size={20} />
            </div>
            <IconMore size={16} className="text-[#6E7C73] cursor-pointer hover:text-[#26332B]" />
          </div>
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            MEDIUM QUALITY
          </div>
          <div className="text-2xl font-extrabold text-[#D98B24] mt-0.5 tracking-tight">
            {stats.medium_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#26332B] mt-2">
            <span>{stats.medium_pct}%</span>
            <span className="text-[#6E7C73] font-normal">of all samples</span>
          </div>
        </div>

        {/* Card 4: Low Quality */}
        <div className="card-base p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAECEB] text-[#BB5A55] flex items-center justify-center">
              <IconAlert size={20} />
            </div>
            <IconMore size={16} className="text-[#6E7C73] cursor-pointer hover:text-[#26332B]" />
          </div>
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            LOW QUALITY
          </div>
          <div className="text-2xl font-extrabold text-[#BB5A55] mt-0.5 tracking-tight">
            {stats.low_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#BB5A55] mt-2">
            <span>{stats.low_pct}%</span>
            <span className="text-[#6E7C73] font-normal">needs attention</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          C & D: Recent Predictions & Quality Distribution
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Predictions Table (2 cols on lg) */}
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                Recent Predictions
              </h3>
              <p className="text-xs text-[#6E7C73] mt-0.5">
                Latest milk sample analysis results
              </p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-[#216B45] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE6] text-[#6E7C73] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Sample ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">pH</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Fat</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE6]">
                {recentPredictions.slice(0, 5).map((row) => {
                  const q = row.predicted_quality;
                  const badgeColor =
                    q === 'high'
                      ? 'bg-[#E8F5EC] text-[#216B45] border-[#C3E2CD]'
                      : q === 'medium'
                        ? 'bg-[#FFF3DC] text-[#D98B24] border-[#F3DBB0]'
                        : 'bg-[#FAECEB] text-[#BB5A55] border-[#EBC6C4]';
                  const dotColor =
                    q === 'high' ? 'bg-[#216B45]' : q === 'medium' ? 'bg-[#D98B24]' : 'bg-[#BB5A55]';

                  return (
                    <tr key={row.sample_id} className="hover:bg-[#F8FAF8] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#26332B]">{row.sample_id}</td>
                      <td className="py-3 px-3 text-[#6E7C73]">{row.created_at}</td>
                      <td className="py-3 px-3 font-semibold text-[#26332B]">{row.ph.toFixed(1)}</td>
                      <td className="py-3 px-3 text-[#26332B]">{row.temperature.toFixed(1)}°C</td>
                      <td className="py-3 px-3 text-[#6E7C73]">
                        {row.fat === 1 ? 'Present' : 'Absent'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {row.predicted_label || q.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onViewRecord(row)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#216B45] hover:text-[#154E31]"
                        >
                          <IconEye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Distribution Donut Card (1 col on lg) */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#26332B] tracking-tight">
              Quality Distribution
            </h3>
            <p className="text-xs text-[#6E7C73] mt-0.5">All analyzed samples</p>

            {/* Visual Donut Diagram */}
            <div className="relative my-6 flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                {/* Background Ring */}
                <circle cx="90" cy="90" r="70" stroke="#E4EAE6" strokeWidth="18" fill="none" />
                {/* High Quality Segment (approx 57%) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  stroke="#216B45"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray={`${(stats.high_pct / 100) * 440} 440`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Medium Quality Segment (approx 30%) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  stroke="#D98B24"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray={`${(stats.medium_pct / 100) * 440} 440`}
                  strokeDashoffset={`-${(stats.high_pct / 100) * 440}`}
                  strokeLinecap="round"
                />
                {/* Low Quality Segment (approx 13%) */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  stroke="#BB5A55"
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray={`${(stats.low_pct / 100) * 440} 440`}
                  strokeDashoffset={`-${((stats.high_pct + stats.medium_pct) / 100) * 440}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#26332B] leading-none">
                  {stats.total_samples.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider mt-0.5">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Legend Below Chart */}
          <div className="space-y-2 pt-2 border-t border-[#E4EAE6] text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#216B45]" />
                <span className="font-medium text-[#26332B]">High Quality</span>
              </div>
              <span className="text-[#6E7C73]">
                {stats.high_count} samples — <strong>{stats.high_pct}%</strong>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D98B24]" />
                <span className="font-medium text-[#26332B]">Medium Quality</span>
              </div>
              <span className="text-[#6E7C73]">
                {stats.medium_count} samples — <strong>{stats.medium_pct}%</strong>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BB5A55]" />
                <span className="font-medium text-[#26332B]">Low Quality</span>
              </div>
              <span className="text-[#6E7C73]">
                {stats.low_count} samples — <strong>{stats.low_pct}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          E. AI Insight Banner
          ------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-[#E8F5EC] border border-[#C3E2CD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-[#216B45] flex items-center justify-center shrink-0 shadow-xs">
            <IconSparkle size={20} className="text-[#216B45]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
              AI QUALITY INSIGHT
            </div>
            <div className="text-sm font-bold text-[#154E31] mt-0.5">
              High-quality samples increased by 8.2% this week.
            </div>
            <div className="text-xs text-[#3E5A47] mt-0.5">
              Your recent samples show improved pH stability and lower average temperature variance.
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('analytics')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-colors shrink-0 shadow-xs"
        >
          View analytics →
        </button>
      </div>
    </div>
  );
};

