export type Page = 'dashboard' | 'analysis' | 'history' | 'analytics' | 'training' | 'about' | 'settings';

export type MilkQuality = 'high' | 'medium' | 'low';

export interface TrainingEvaluationData {
  dataset: {
    total_raw_records: number;
    duplicate_records_removed: number;
    unique_records: number;
  };
  split: {
    strategy: string;
    train_samples: number;
    train_pct: number;
    test_samples: number;
    test_pct: number;
  };
  model: {
    algorithm: string;
    description: string;
  };
  holdout_test: {
    test_samples: number;
    correct_predictions: number;
    incorrect_predictions: number;
    test_accuracy: number;
    formula: string;
    calculation_display: string;
  };
  cross_validation: {
    method: string;
    folds: number;
    mean_accuracy: number;
    mean_macro_f1: number;
    description: string;
  };
  workflow_steps: Array<{
    step: number;
    title: string;
    desc: string;
  }>;
}

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

