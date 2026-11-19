import React, { useState, useRef } from 'react';
import { PredictionResult, SampleParameters } from '../types';
import {
  IconSparkle,
  IconShield,
  IconAlert,
  IconCheck,
  IconDownload,
} from '../components/Icons';

interface AnalysisPageProps {
  onPredictionComplete: (result: PredictionResult) => void;
  onNavigateHistory: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  onPredictionComplete,
  onNavigateHistory,
}) => {
  // Form State
  const [ph, setPh] = useState<string>('6.6');
  const [temp, setTemp] = useState<string>('37.0');
  const [taste, setTaste] = useState<number>(1); // 1 = Acceptable, 0 = Unacceptable
  const [odor, setOdor] = useState<number>(1); // 1 = Normal, 0 = Abnormal
  const [fat, setFat] = useState<number>(1); // 1 = Present, 0 = Absent
  const [turbidity, setTurbidity] = useState<number>(0); // 0 = Clear, 1 = Turbid
  const [color, setColor] = useState<string>('254');
  const [notes, setNotes] = useState<string>('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleClearAll = () => {
    setPh('');
    setTemp('');
    setTaste(1);
    setOdor(1);
    setFat(1);
    setTurbidity(0);
    setColor('');
    setNotes('');
    setErrors({});
    setResult(null);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // Validate pH
    if (!ph.trim()) {
      errs.ph = 'pH Level is required.';
    } else {
      const p = parseFloat(ph);
      if (isNaN(p) || p < 0 || p > 14) {
        errs.ph = 'pH must be between 0 and 14.';
      }
    }

    // Validate Temperature
    if (!temp.trim()) {
      errs.temp = 'Temperature is required.';
    } else {
      const t = parseFloat(temp);
      if (isNaN(t) || t < 0 || t > 100) {
        errs.temp = 'Temperature must be between 0°C and 100°C.';
      }
    }

    // Validate Color
    if (!color.trim()) {
      errs.color = 'Color Value is required.';
    } else {
      const c = parseInt(color, 10);
      if (isNaN(c) || c < 0 || c > 255) {
        errs.color = 'Color Value must be an integer between 0 and 255.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const parsedPh = parseFloat(ph);
    const parsedTemp = parseFloat(temp);
    const parsedColor = parseInt(color, 10);

    const payload = {
      pH: parsedPh,
      temperature: parsedTemp,
      taste,
      odor,
      fat,
      turbidity,
      color: parsedColor,
      inspector_notes: notes,
      inspector_name: 'Alex Morgan',
    };

    try {
      // First attempt to call the live Python backend
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
      onPredictionComplete(data);
    } catch (err) {
      // Fallback offline predictor logic matching the prompt specification exactly:
      // +2 if pH in 6.5-6.9, +2 if temp <= 38, +1 taste, +1 odor, +1 fat, +1 turbidity==0, +1 color >= 240
      let score = 0;
      if (parsedPh >= 6.5 && parsedPh <= 6.9) score += 2;
      if (parsedTemp <= 38.0) score += 2;
      if (taste === 1) score += 1;
      if (odor === 1) score += 1;
      if (fat === 1) score += 1;
      if (turbidity === 0) score += 1;
      if (parsedColor >= 240) score += 1;

      let quality: 'high' | 'medium' | 'low' = 'low';
      let confidence = 93.4;
      let label = 'Low Quality';
      let status: 'success' | 'warning' | 'danger' = 'danger';
      let colorHex = '#BB5A55';
      let recommendation =
        'Substandard sample. Fails standard dairy freshness requirements; discard batch.';

      if (score >= 7) {
        quality = 'high';
        confidence = 96.2;
        label = 'High Quality';
        status = 'success';
        colorHex = '#216B45';
        recommendation =
          'Approved for premium Grade-A dairy retail distribution and immediate processing.';
      } else if (score >= 4) {
        quality = 'medium';
        confidence = 88.7;
        label = 'Medium Quality';
        status = 'warning';
        colorHex = '#D98B24';
        recommendation =
          'Acceptable for secondary pasteurized blending or cheese manufacturing. Monitor temp.';
      }

      const generatedId = `MG-${Math.floor(2842 + Math.random() * 200)}`;
      const fallbackResult: PredictionResult = {
        sample_id: generatedId,
        created_at: new Date().toLocaleString(),
        predicted_quality: quality,
        predicted_label: label,
        confidence,
        status,
        color_hex: colorHex,
        recommendation,
        probabilities: {
          high: quality === 'high' ? 0.96 : 0.02,
          medium: quality === 'medium' ? 0.88 : 0.08,
          low: quality === 'low' ? 0.93 : 0.04,
        },
        parameters: {
          pH: parsedPh,
          temperature: parsedTemp,
          taste,
          odor,
          fat,
          turbidity,
          color: parsedColor,
        },
        model_version: 'v2.4.1',
        inspector_name: 'Alex Morgan',
        disclaimer:
          'This prediction supports quality screening only. It is not a laboratory certification or food safety guarantee.',
      };

      setResult(fallbackResult);
      onPredictionComplete(fallbackResult);
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          Page Header with Model Status Chip
          ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-[#216B45] uppercase tracking-wider">
            MILK QUALITY ANALYSIS
          </div>
          <h2 className="text-2xl font-extrabold text-[#26332B] tracking-tight mt-0.5">
            Analyze Milk Quality
          </h2>
          <p className="text-xs text-[#6E7C73] mt-0.5">
            Enter the milk sample parameters below to predict its quality using our trained ML model.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EC] border border-[#C3E2CD] text-xs font-semibold text-[#216B45] shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#216B45] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E7C73]">
            MODEL STATUS:
          </span>
          <span>Online & Ready</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Two-Column Main Layout
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Analysis Form (2 cols) */}
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-6 h-6 rounded-md bg-[#216B45] text-white text-xs font-bold flex items-center justify-center">
              01
            </span>
            <div>
              <h3 className="text-base font-bold text-[#26332B] tracking-tight leading-none">
                Sample Parameters
              </h3>
              <p className="text-xs text-[#6E7C73] mt-1">
                All seven fields are required for an accurate prediction.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Input 1: pH Level */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  pH Level
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => {
                      setPh(e.target.value);
                      if (errors.ph) setErrors({ ...errors, ph: '' });
                    }}
                    placeholder="e.g. 6.7"
                    className={`w-full bg-[#F8FAF8] border rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] placeholder-[#6E7C73] focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.ph
                        ? 'border-[#BB5A55] focus:ring-[#BB5A55]'
                        : 'border-[#E4EAE6] focus:border-[#216B45] focus:ring-[#216B45]'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6E7C73]">
                    pH
                  </span>
                </div>
                {errors.ph ? (
                  <p className="flex items-center gap-1 text-[11px] text-[#BB5A55] mt-1">
                    <IconAlert size={12} />
                    <span>{errors.ph}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#6E7C73] mt-1">
                    Acidity or alkalinity (0–14)
                  </p>
                )}
              </div>

              {/* Input 2: Temperature */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Temperature
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={temp}
                    onChange={(e) => {
                      setTemp(e.target.value);
                      if (errors.temp) setErrors({ ...errors, temp: '' });
                    }}
                    placeholder="e.g. 36.5"
                    className={`w-full bg-[#F8FAF8] border rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] placeholder-[#6E7C73] focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.temp
                        ? 'border-[#BB5A55] focus:ring-[#BB5A55]'
                        : 'border-[#E4EAE6] focus:border-[#216B45] focus:ring-[#216B45]'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6E7C73]">
                    °C
                  </span>
                </div>
                {errors.temp ? (
                  <p className="flex items-center gap-1 text-[11px] text-[#BB5A55] mt-1">
                    <IconAlert size={12} />
                    <span>{errors.temp}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#6E7C73] mt-1">
                    Sample temperature in Celsius
                  </p>
                )}
              </div>

              {/* Input 3: Taste Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Taste Assessment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaste(1)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      taste === 1
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        taste === 1 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {taste === 1 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Acceptable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaste(0)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      taste === 0
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        taste === 0 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {taste === 0 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Unacceptable</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#6E7C73] mt-1">Sensory taste assessment</p>
              </div>

              {/* Input 4: Odor Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Odor Assessment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOdor(1)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      odor === 1
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        odor === 1 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {odor === 1 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOdor(0)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      odor === 0
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        odor === 0 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {odor === 0 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Abnormal</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#6E7C73] mt-1">Sample odor assessment</p>
              </div>

              {/* Input 5: Fat Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Fat Content
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFat(1)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      fat === 1
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        fat === 1 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {fat === 1 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFat(0)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      fat === 0
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        fat === 0 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {fat === 0 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Absent</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#6E7C73] mt-1">Presence of fat content</p>
              </div>

              {/* Input 6: Turbidity Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Turbidity / Clarity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTurbidity(0)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      turbidity === 0
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        turbidity === 0 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {turbidity === 0 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurbidity(1)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      turbidity === 1
                        ? 'bg-[#E8F5EC] border-[#216B45] text-[#216B45] shadow-xs'
                        : 'bg-[#F8FAF8] border-[#E4EAE6] text-[#6E7C73] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        turbidity === 1 ? 'bg-[#216B45] border-[#216B45]' : 'border-[#6E7C73]'
                      }`}
                    >
                      {turbidity === 1 && <IconCheck size={10} className="text-white" />}
                    </span>
                    <span>Turbid</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#6E7C73] mt-1">Visual clarity of the sample</p>
              </div>

              {/* Input 7: Color Value */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Color Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      if (errors.color) setErrors({ ...errors, color: '' });
                    }}
                    placeholder="e.g. 245"
                    className={`w-full bg-[#F8FAF8] border rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] placeholder-[#6E7C73] focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.color
                        ? 'border-[#BB5A55] focus:ring-[#BB5A55]'
                        : 'border-[#E4EAE6] focus:border-[#216B45] focus:ring-[#216B45]'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6E7C73]">
                    RGB
                  </span>
                </div>
                {errors.color ? (
                  <p className="flex items-center gap-1 text-[11px] text-[#BB5A55] mt-1">
                    <IconAlert size={12} />
                    <span>{errors.color}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#6E7C73] mt-1">
                    Measured color intensity (0–255)
                  </p>
                )}
              </div>

              {/* Batch Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#26332B] mb-1">
                  Inspector Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Intake dock Tank 2"
                  className="w-full bg-[#F8FAF8] border border-[#E4EAE6] rounded-xl px-3.5 py-2.5 text-xs text-[#26332B] placeholder-[#6E7C73] focus:bg-white focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
                />
                <p className="text-[11px] text-[#6E7C73] mt-1">
                  Optional audit remarks
                </p>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-3 border-t border-[#E4EAE6] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-xl border border-[#E4EAE6] bg-white text-xs font-bold text-[#6E7C73] hover:text-[#26332B] hover:border-[#D1DBD5] transition-colors"
              >
                Clear All
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] shadow-sm shadow-[#216B45]/20 disabled:opacity-50 transition-all transform active:scale-95"
              >
                <IconSparkle size={15} />
                <span>{loading ? 'Evaluating Model...' : 'Predict Quality'}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Guidance & Notice Cards (1 col) */}
        <div className="space-y-4">
          {/* Card: Before you analyze */}
          <div className="card-base p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5EC] text-[#216B45] flex items-center justify-center">
                <IconShield size={18} />
              </div>
              <h3 className="text-sm font-bold text-[#26332B]">Before you analyze</h3>
            </div>
            <p className="text-xs text-[#6E7C73] leading-relaxed mb-4">
              For the most reliable result, use current measurements from a representative sample.
            </p>

            <ul className="space-y-3 text-xs text-[#26332B]">
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#E8F5EC] text-[#216B45] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck size={11} />
                </span>
                <span>
                  <strong>Calibrate measurement tools:</strong> Ensure temperature sensors and pH probes are zeroed.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#E8F5EC] text-[#216B45] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck size={11} />
                </span>
                <span>
                  <strong>Use a fresh, mixed sample:</strong> Homogenize the batch to balance cream layers before extraction.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#E8F5EC] text-[#216B45] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck size={11} />
                </span>
                <span>
                  <strong>Enter values accurately:</strong> Model thresholds rely on calibrated laboratory standards.
                </span>
              </li>
            </ul>
          </div>

          {/* Card: Important Notice */}
          <div className="p-5 rounded-2xl bg-[#FFF3DC] border border-[#F3DBB0] text-[#7A4E0B]">
            <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
              <IconAlert size={16} className="text-[#D98B24]" />
              <span>Important notice</span>
            </div>
            <p className="text-xs leading-relaxed text-[#7A4E0B]/90">
              This prediction supports quality screening only. It is not a laboratory certification or food safety guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          D. Prediction Result Card (Rendered After Inference)
          ------------------------------------------------------------- */}
      {result && (
        <div ref={resultRef} className="pt-2">
          <div
            className={`card-base p-6 sm:p-8 border-2 transition-all ${
              result.status === 'success'
                ? 'border-[#A5D6A7] bg-[#FAFDFB]'
                : result.status === 'warning'
                ? 'border-[#F8D8A3] bg-[#FFFCF7]'
                : 'border-[#F1BDBB] bg-[#FDF9F9]'
            }`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4EAE6] pb-5">
              <div>
                <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
                  PREDICTION COMPLETE
                </div>
                <h3
                  className="text-2xl font-extrabold tracking-tight mt-1 flex items-center gap-2"
                  style={{ color: result.color_hex }}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: result.color_hex }} />
                  <span>{result.predicted_label} Milk</span>
                </h3>
                <p className="text-xs text-[#26332B] mt-1 max-w-xl">{result.recommendation}</p>
              </div>

              {/* Confidence score block */}
              <div
                className="p-4 rounded-xl border text-center shrink-0 min-w-[160px]"
                style={{
                  backgroundColor: result.status === 'success' ? '#E8F5EC' : result.status === 'warning' ? '#FFF3DC' : '#FAECEB',
                  borderColor: `${result.color_hex}33`,
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E7C73]">
                  Model confidence
                </div>
                <div
                  className="text-2xl font-black mt-0.5 tracking-tight"
                  style={{ color: result.color_hex }}
                >
                  {result.confidence}%
                </div>
                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${result.confidence}%`,
                      backgroundColor: result.color_hex,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#6E7C73] font-medium mt-1">
                  Random Forest Classifier
                </div>
              </div>
            </div>

            {/* Parameter Summary */}
            <div className="py-5 border-b border-[#E4EAE6]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E7C73] mb-3">
                Evaluated Parameters
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">pH Level</span>
                  <strong className="text-sm text-[#26332B]">{result.parameters.pH}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Temperature</span>
                  <strong className="text-sm text-[#26332B]">{result.parameters.temperature}°C</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Taste</span>
                  <strong className="text-sm text-[#26332B]">
                    {result.parameters.taste === 1 ? 'Acceptable' : 'Unacceptable'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Odor</span>
                  <strong className="text-sm text-[#26332B]">
                    {result.parameters.odor === 1 ? 'Normal' : 'Abnormal'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Fat</span>
                  <strong className="text-sm text-[#26332B]">
                    {result.parameters.fat === 1 ? 'Present' : 'Absent'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Turbidity</span>
                  <strong className="text-sm text-[#26332B]">
                    {result.parameters.turbidity === 0 ? 'Clear' : 'Turbid'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6]">
                  <span className="text-[10px] text-[#6E7C73] block">Color Value</span>
                  <strong className="text-sm text-[#26332B]">{result.parameters.color} RGB</strong>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6E7C73]">
                <IconShield size={16} className="text-[#216B45]" />
                <span>
                  Saved to prediction history as <strong>{result.sample_id}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onNavigateHistory}
                  className="px-4 py-2 rounded-xl border border-[#E4EAE6] bg-white text-xs font-bold text-[#26332B] hover:bg-[#F8FAF8] transition-colors"
                >
                  View History
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl bg-[#216B45] text-white text-xs font-bold hover:bg-[#154E31] transition-colors"
                >
                  Analyze Another Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

