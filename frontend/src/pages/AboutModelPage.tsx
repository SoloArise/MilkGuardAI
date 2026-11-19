import React from 'react';
import {
  IconCpu,
  IconSparkle,
  IconShield,
  IconCheck,
  IconBarChart,
  IconClock,
  IconFlask,
} from '../components/Icons';

export const AboutModelPage: React.FC = () => {
  const workflowSteps = [
    { num: '01', title: 'Dataset', desc: '1,059 samples', icon: IconFlask },
    { num: '02', title: 'Preprocessing', desc: 'Clean & normalize', icon: IconSparkle },
    { num: '03', title: 'Feature Selection', desc: '7 parameters', icon: IconCpu },
    { num: '04', title: 'Model Training', desc: 'Random Forest', icon: IconClock },
    { num: '05', title: 'Evaluation', desc: 'Cross-validated', icon: IconBarChart },
    { num: '06', title: 'Prediction', desc: '3 classes', icon: IconShield },
  ];

  const featuresList = [
    { num: '1', name: 'pH Level', desc: 'Measures chemical acidity or alkalinity (optimal: 6.5–6.8)' },
    { num: '2', name: 'Temperature', desc: 'Storage or sampling temperature in Celsius (normal: 34–40°C)' },
    { num: '3', name: 'Taste', desc: 'Sensory assessment of palate acceptability (optimal: 1, substandard: 0)' },
    { num: '4', name: 'Odor', desc: 'Olfactory freshness assessment (normal: 1, abnormal/sour: 0)' },
    { num: '5', name: 'Fat Content', desc: 'Fat presence verifying dairy standard density (present: 1, absent: 0)' },
    { num: '6', name: 'Turbidity', desc: 'Visual clarity and colloidal suspension (clear: 0, turbid: 1)' },
    { num: '7', name: 'Color Value', desc: 'Measured photometric color intensity on an 8-bit scale (240–255 RGB)' },
  ];

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          Page Header
          ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
            TRANSPARENT AI
          </div>
          <h2 className="text-2xl font-extrabold text-[#26332B] tracking-tight mt-0.5">
            About the Model
          </h2>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            Understand how MilkGuard AI turns sample measurements into quality insights.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-[#E8F5EC] border border-[#C3E2CD] text-xs font-bold text-[#216B45] shrink-0 self-start sm:self-auto">
          Model v2.4.1
        </span>
      </div>

      {/* -------------------------------------------------------------
          A. Model Hero Card
          ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-gradient-to-r from-[#154E31] via-[#1A5C3A] to-[#216B45] text-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#A5D6A7] uppercase">
              <IconCpu size={14} />
              <span>MACHINE LEARNING MODEL</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Random Forest Classifier
            </h3>
            <p className="text-xs sm:text-sm text-[#E8F5EC]/90 leading-relaxed max-w-xl font-normal">
              An ensemble learning model trained to classify milk samples into High, Medium, or Low quality using seven measurable parameters. The algorithm builds 200 de-correlated decision trees with balanced class weighting to eliminate bias.
            </p>

            <div className="pt-3 flex flex-wrap gap-6 text-xs border-t border-white/20">
              <div>
                <span className="text-[#A5D6A7] block text-[10px] uppercase font-bold">
                  Last trained
                </span>
                <strong className="text-white">May 18, 2025</strong>
              </div>
              <div>
                <span className="text-[#A5D6A7] block text-[10px] uppercase font-bold">
                  Training samples
                </span>
                <strong className="text-white">1,059</strong>
              </div>
              <div>
                <span className="text-[#A5D6A7] block text-[10px] uppercase font-bold">
                  Output classes
                </span>
                <strong className="text-white">3 Classes</strong>
              </div>
              <div>
                <span className="text-[#A5D6A7] block text-[10px] uppercase font-bold">
                  Estimators
                </span>
                <strong className="text-white">200 Decision Trees</strong>
              </div>
            </div>

            <div className="mt-2 p-2 rounded-lg bg-black/25 text-[11px] font-mono text-[#E8F5EC] border border-white/10 break-all">
              📁 <strong>Model Source:</strong> F:\Harsh\Erudite\Graphic Era\Semester 3\Mini Project\Models\milk_quality_model.pkl
            </div>
          </div>

          {/* Right: Abstract Decision-Tree Visualization */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A5D6A7] mb-3">
              Ensemble Decision Graph
            </div>
            <svg width="200" height="130" viewBox="0 0 200 130" fill="none">
              {/* Connecting lines */}
              <line x1="100" y1="20" x2="50" y2="60" stroke="#A5D6A7" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="20" x2="150" y2="60" stroke="#A5D6A7" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="50" y1="60" x2="25" y2="105" stroke="#A5D6A7" strokeWidth="1.5" />
              <line x1="50" y1="60" x2="75" y2="105" stroke="#A5D6A7" strokeWidth="1.5" />
              <line x1="150" y1="60" x2="125" y2="105" stroke="#A5D6A7" strokeWidth="1.5" />
              <line x1="150" y1="60" x2="175" y2="105" stroke="#A5D6A7" strokeWidth="1.5" />

              {/* Node 1 Root: pH */}
              <circle cx="100" cy="20" r="14" fill="#216B45" stroke="#FFFFFF" strokeWidth="2" />
              <text x="100" y="24" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">pH</text>

              {/* Node 2 & 3: Temp & Fat */}
              <circle cx="50" cy="60" r="12" fill="#154E31" stroke="#A5D6A7" strokeWidth="1.5" />
              <text x="50" y="63" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Temp</text>

              <circle cx="150" cy="60" r="12" fill="#154E31" stroke="#A5D6A7" strokeWidth="1.5" />
              <text x="150" y="63" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Fat</text>

              {/* Leaves */}
              <circle cx="25" cy="105" r="9" fill="#216B45" stroke="#FFFFFF" strokeWidth="1" />
              <text x="25" y="108" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">High</text>

              <circle cx="75" cy="105" r="9" fill="#D98B24" stroke="#FFFFFF" strokeWidth="1" />
              <text x="75" y="108" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Med</text>

              <circle cx="125" cy="105" r="9" fill="#D98B24" stroke="#FFFFFF" strokeWidth="1" />
              <text x="125" y="108" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Med</text>

              <circle cx="175" cy="105" r="9" fill="#BB5A55" stroke="#FFFFFF" strokeWidth="1" />
              <text x="175" y="108" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Low</text>
            </svg>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          B. Model Metrics (4 cards)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5 space-y-2">
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            ACCURACY
          </div>
          <div className="text-2xl font-extrabold text-[#216B45]">94.8%</div>
          <div className="text-xs text-[#6E7C73]">Overall correct predictions</div>
          <div className="w-full bg-[#E4EAE6] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#216B45] h-full rounded-full" style={{ width: '94.8%' }} />
          </div>
        </div>

        <div className="card-base p-5 space-y-2">
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            PRECISION
          </div>
          <div className="text-2xl font-extrabold text-[#216B45]">93.6%</div>
          <div className="text-xs text-[#6E7C73]">Positive prediction accuracy</div>
          <div className="w-full bg-[#E4EAE6] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#216B45] h-full rounded-full" style={{ width: '93.6%' }} />
          </div>
        </div>

        <div className="card-base p-5 space-y-2">
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            RECALL
          </div>
          <div className="text-2xl font-extrabold text-[#216B45]">94.1%</div>
          <div className="text-xs text-[#6E7C73]">Correct class identification</div>
          <div className="w-full bg-[#E4EAE6] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#216B45] h-full rounded-full" style={{ width: '94.1%' }} />
          </div>
        </div>

        <div className="card-base p-5 space-y-2">
          <div className="text-[11px] font-bold text-[#6E7C73] uppercase tracking-wider">
            F1-SCORE
          </div>
          <div className="text-2xl font-extrabold text-[#216B45]">93.8%</div>
          <div className="text-xs text-[#6E7C73]">Precision-recall balance</div>
          <div className="w-full bg-[#E4EAE6] h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#216B45] h-full rounded-full" style={{ width: '93.8%' }} />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          C. Machine-Learning Workflow (6-step horizontal)
          ------------------------------------------------------------- */}
      <div className="card-base p-6">
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#26332B] tracking-tight">
            How the Model Works
          </h3>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            From raw sample data to quality prediction
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex flex-col justify-between space-y-3 relative hover:border-[#216B45]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#216B45]">
                    {step.num}
                  </span>
                  <Icon size={16} className="text-[#6E7C73]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#26332B]">{step.title}</div>
                  <div className="text-[11px] text-[#6E7C73] mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------
          D. Input Features List
          ------------------------------------------------------------- */}
      <div className="card-base p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#26332B] tracking-tight">
            Input Features Schema
          </h3>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            All seven mandatory predictors evaluated by the Random Forest classifier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuresList.map((f) => (
            <div
              key={f.num}
              className="p-3 rounded-xl border border-[#E4EAE6] flex items-start gap-3 hover:bg-[#F8FAF8] transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-[#E8F5EC] text-[#216B45] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {f.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#26332B]">{f.name}</span>
                  <IconCheck size={14} className="text-[#216B45]" />
                </div>
                <p className="text-[11px] text-[#6E7C73] mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------
          E. Responsible AI Banner
          ------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-[#E8F5EC] border border-[#C3E2CD] flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white text-[#216B45] flex items-center justify-center shrink-0 shadow-xs">
          <IconShield size={20} className="text-[#216B45]" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#154E31]">Responsible AI Usage</div>
          <p className="text-xs text-[#3E5A47] leading-relaxed">
            MilkGuard AI is a decision-support tool designed to assist trained professionals. Predictions should be validated with standard quality assurance procedures.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#216B45] hover:underline cursor-pointer">
              Read our model documentation →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

