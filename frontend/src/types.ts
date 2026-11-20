export type Page = 'dashboard' | 'analysis' | 'history' | 'analytics' | 'training' | 'about' | 'settings';

export type MilkQuality = 'high' | 'medium' | 'low';

export interface TrainingEvaluationData {
  metadata: {
    dataset_filename: string;
    dataset_sha256: string;
    original_sample_count: number;
    duplicate_rows_removed: number;
    deduplicated_sample_count: number;
    original_class_distribution: Record<string, number>;
    deduplicated_class_distribution: Record<string, number>;
    random_seed: number;
    train_test_split: string;
    cross_validation: string;
    training_sample_count: number;
    testing_sample_count: number;
    training_class_distribution: Record<string, number>;
    testing_class_distribution: Record<string, number>;
    python_version: string;
    scikit_learn_version: string;
    evaluation_timestamp_utc: string;
    small_unique_dataset_notice: string;
    model_selection_note: string;
    validation_note: string;
  };
  models: Record<string, {
    python_class: string;
    model_parameters: Record<string, unknown>;
    training_seconds: number;
    prediction_seconds: number;
    holdout_metrics: Record<string, number>;
    cross_validation_on_training_partition: Record<string, {
      fold_scores: number[];
      mean: number;
      std: number;
    }>;
    confusion_matrix: {
      labels: string[];
      matrix: number[][];
    };
    classification_report: Record<string, number | {
      precision: number;
      recall: number;
      f1_score?: number;
      'f1-score'?: number;
      support: number;
    }>;
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

