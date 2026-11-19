import React from 'react';
import { StatsData } from '../types';
import {
  IconFlask,
  IconCheck,
  IconTrend,
  IconCpu,
  IconDownload,
} from '../components/Icons';

interface AnalyticsPageProps {
  stats: StatsData;
  onDownloadReport: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  stats,
  onDownloadReport,
}) => {
  // Weekly trend curve from prompt specifications: [38, 48, 44, 61, 56, 70, 66, 78, 72, 86, 79, 92]
  const weeklyTrends = [
    { week: 'W1', value: 38 },
    { week: 'W2', value: 48 },
    { week: 'W3', value: 44 },
    { week: 'W4', value: 61 },
    { week: 'W5', value: 56 },
    { week: 'W6', value: 70 },
    { week: 'W7', value: 66 },
    { week: 'W8', value: 78 },
    { week: 'W9', value: 72 },
    { week: 'W10', value: 86 },
    { week: 'W11', value: 79 },
    { week: 'W12', value: 92 },
  ];

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          Page Header
          ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
            PERFORMANCE OVERVIEW
          </div>
          <h2 className="text-2xl font-extrabold text-[#26332B] tracking-tight mt-0.5">
            Analytics & Reports
          </h2>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            Track sample quality and discover trends across your dairy operations.
          </p>
        </div>

        <button
          onClick={onDownloadReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <IconDownload size={15} />
          <span>Download Report</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          A. Summary Metrics (4 cards)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
              TOTAL SAMPLES
            </span>
            <IconFlask size={18} className="text-[#216B45]" />
          </div>
          <div className="text-2xl font-extrabold text-[#26332B] tracking-tight">
            {stats.total_samples.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-[#216B45] mt-1">
            ↑ 12.4% <span className="text-[#6E7C73] font-normal">this month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
              QUALITY PASS RATE
            </span>
            <IconCheck size={18} className="text-[#216B45]" />
          </div>
          <div className="text-2xl font-extrabold text-[#216B45] tracking-tight">
            {stats.pass_rate}%
          </div>
          <div className="text-xs font-semibold text-[#216B45] mt-1">
            ↑ 3.2% <span className="text-[#6E7C73] font-normal">improvement</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
              DAILY AVERAGE
            </span>
            <IconTrend size={18} className="text-[#6E7C73]" />
          </div>
          <div className="text-2xl font-extrabold text-[#26332B] tracking-tight">94.9</div>
          <div className="text-xs text-[#6E7C73] mt-1 font-normal">samples per day</div>
        </div>

        {/* Metric 4 */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
              MODEL CONFIDENCE
            </span>
            <IconCpu size={18} className="text-[#216B45]" />
          </div>
          <div className="text-2xl font-extrabold text-[#26332B] tracking-tight">
            {stats.avg_confidence > 0 ? stats.avg_confidence : 94.2}%
          </div>
          <div className="text-xs text-[#6E7C73] mt-1 font-normal">average confidence</div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          B & C: Quality Trends Chart & Distribution Donut
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Trends Vertical Bar Chart (2 cols) */}
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#26332B] tracking-tight">
                Quality Trends
              </h3>
              <p className="text-xs text-[#6E7C73] mt-0.5">
                High-quality samples over the last 12 weeks
              </p>
            </div>
            <span className="text-xs font-semibold text-[#216B45] bg-[#E8F5EC] border border-[#C3E2CD] px-3 py-1 rounded-full">
              Last 12 weeks
            </span>
          </div>

          {/* Bar Chart Canvas / SVG Container */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-[#E4EAE6]">
            {weeklyTrends.map((t, idx) => {
              const heightPct = t.value;
              return (
                <div key={t.week} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-[#216B45] opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.value}%
                  </span>
                  <div className="w-full bg-[#E8F5EC] rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-[#216B45] group-hover:bg-[#154E31] transition-all duration-300 rounded-t-lg"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#6E7C73] group-hover:text-[#26332B]">
                    {t.week}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6E7C73] mt-3">
            <span>Baseline: W1 (38%)</span>
            <span className="font-bold text-[#216B45]">Current: W12 (92% Grade-A Quality)</span>
          </div>
        </div>

        {/* Quality Distribution Donut Card (1 col) */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#26332B] tracking-tight">
              Quality Distribution
            </h3>
            <p className="text-xs text-[#6E7C73] mt-0.5">All analyzed samples</p>

            <div className="relative my-6 flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle cx="90" cy="90" r="70" stroke="#E4EAE6" strokeWidth="18" fill="none" />
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
          D. Parameter Averages by Quality (3 cards)
          ------------------------------------------------------------- */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#26332B] tracking-tight">
            Parameter Averages by Quality
          </h3>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            Compare key sample measurements across classifications based on empirical 1,059 dairy benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: pH */}
          <div className="card-base p-5 space-y-3">
            <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
              MEASUREMENT 01
            </div>
            <h4 className="text-sm font-bold text-[#26332B]">Average pH Level</h4>

            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">High</span>
                  <strong className="text-[#216B45]">6.72</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#216B45] h-full rounded-full" style={{ width: '67.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Medium</span>
                  <strong className="text-[#D98B24]">6.43</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D98B24] h-full rounded-full" style={{ width: '64.3%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Low</span>
                  <strong className="text-[#BB5A55]">5.91</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#BB5A55] h-full rounded-full" style={{ width: '59.1%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Temperature */}
          <div className="card-base p-5 space-y-3">
            <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
              MEASUREMENT 02
            </div>
            <h4 className="text-sm font-bold text-[#26332B]">Temperature (°C)</h4>

            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">High</span>
                  <strong className="text-[#216B45]">36.4°C</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#216B45] h-full rounded-full" style={{ width: '36.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Medium</span>
                  <strong className="text-[#D98B24]">38.7°C</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D98B24] h-full rounded-full" style={{ width: '38.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Low</span>
                  <strong className="text-[#BB5A55]">42.1°C</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#BB5A55] h-full rounded-full" style={{ width: '42.1%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Fat presence */}
          <div className="card-base p-5 space-y-3">
            <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
              MEASUREMENT 03
            </div>
            <h4 className="text-sm font-bold text-[#26332B]">Fat Presence (%)</h4>

            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">High</span>
                  <strong className="text-[#216B45]">92%</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#216B45] h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Medium</span>
                  <strong className="text-[#D98B24]">71%</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D98B24] h-full rounded-full" style={{ width: '71%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-[#26332B]">Low</span>
                  <strong className="text-[#BB5A55]">38%</strong>
                </div>
                <div className="w-full bg-[#E4EAE6] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#BB5A55] h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

