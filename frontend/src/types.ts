export type Page = 'dashboard' | 'analysis' | 'history' | 'analytics' | 'about' | 'settings';

export type MilkQuality = 'high' | 'medium' | 'low';

export interface SampleParameters {
  pH: number;
  temperature: number;
  taste: number;
  odor: number;
  fat: number;
  turbidity: number;
  color: number;
}

export interface PredictionRecord {
  id?: number;
  sample_id: string;
  created_at: string;
  ph: number;
  temperature: number;
  taste: number;
  odor: number;
  fat: number;
  turbidity: number;
  color: number;
  predicted_quality: MilkQuality;
  predicted_label: string;
  confidence: number;
  proba_high?: number;
  proba_medium?: number;
  proba_low?: number;
  inspector_name?: string;
  inspector_notes?: string;
}

export interface StatsData {
  total_samples: number;
  high_count: number;
  high_pct: number;
  medium_count: number;
  medium_pct: number;
  low_count: number;
  low_pct: number;
  avg_confidence: number;
  pass_rate: number;
}

export interface PredictionResult {
  sample_id: string;
  created_at: string;
  predicted_quality: MilkQuality;
  predicted_label: string;
  confidence: number;
  status: 'success' | 'warning' | 'danger';
  color_hex: string;
  recommendation: string;
  probabilities: {
    high: number;
    medium: number;
    low: number;
  };
  parameters: {
    pH: number;
    temperature: number;
    taste: number;
    odor: number;
    fat: number;
    turbidity: number;
    color: number;
  };
  model_version: string;
  inspector_name: string;
  disclaimer: string;
}

