import React, { useEffect, useState } from 'react';
import { TrainingEvaluationData } from '../types';

const MODEL_LABELS: Record<string, string> = {
  random_forest: 'Random Forest',
  gaussian_nb: 'Gaussian Naive Bayes',
  svm: 'Support Vector Machine (SVM)',
};

const METRIC_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  balanced_accuracy: 'Balanced accuracy',
  macro_precision: 'Macro precision',
  macro_recall: 'Macro recall',
  macro_f1: 'Macro F1',
};

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const ModelTrainingPage: React.FC = () => {
  const [data, setData] = useState<TrainingEvaluationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchEvaluation = async () => {
      try {
        const response = await fetch('/api/analytics/training-evaluation', {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.detail || 'Generated evaluation results are unavailable.');
        }
        if (!payload?.metadata || !payload?.models) {
          throw new Error('The evaluation report is incomplete. Regenerate the report and try again.');
        }
        setData(payload as TrainingEvaluationData);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Could not load evaluation results.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchEvaluation();
    return () => controller.abort();
  }, []);

  if (loading) {
    return <div className="card-base p-6 text-sm text-[#6E7C73]">Loading generated evaluation report…</div>;
  }

  if (error || !data) {
    return (
      <div className="card-base border border-[#EBC6C4] bg-[#FAECEB] p-6" role="alert">
        <h2 className="font-bold text-[#8F3935]">Evaluation results unavailable</h2>
        <p className="mt-2 text-sm text-[#6E7C73]">{error || 'No evaluation report was returned by the backend.'}</p>
        <p className="mt-2 text-xs text-[#6E7C73]">Generate the report with <code>python scripts/train_evaluate.py</code>.</p>
      </div>
    );
  }

  const { metadata, models } = data;
  const modelEntries = Object.entries(models);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#216B45]">Generated ML evaluation</div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#26332B]">Model Training &amp; Evaluation</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7C73]">
          Results below come from the generated evaluation report. Holdout metrics and training-partition cross-validation are shown separately.
        </p>
      </header>

      <section className="card-base p-5" aria-labelledby="evaluation-metadata">
        <h2 id="evaluation-metadata" className="text-base font-bold text-[#26332B]">Dataset and evaluation metadata</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetaItem label="Dataset" value={metadata.dataset_filename} />
          <MetaItem label="Original rows" value={metadata.original_sample_count.toLocaleString()} />
          <MetaItem label="Exact duplicates removed" value={metadata.duplicate_rows_removed.toLocaleString()} />
          <MetaItem label="Unique rows" value={metadata.deduplicated_sample_count.toLocaleString()} />
          <MetaItem label="Train / holdout" value={`${metadata.training_sample_count} / ${metadata.testing_sample_count}`} />
          <MetaItem label="Evaluation date" value={formatDate(metadata.evaluation_timestamp_utc)} />
          <MetaItem label="Python / scikit-learn" value={`${metadata.python_version} / ${metadata.scikit_learn_version}`} />
          <MetaItem label="Random seed" value={String(metadata.random_seed)} />
        </div>
        <div className="mt-4 space-y-2 text-xs text-[#6E7C73]">
          <p><strong>Holdout split:</strong> {metadata.train_test_split}</p>
          <p><strong>Cross-validation:</strong> {metadata.cross_validation}</p>
          <p><strong>Original class distribution:</strong> {JSON.stringify(metadata.original_class_distribution)}</p>
          <p><strong>Deduplicated class distribution:</strong> {JSON.stringify(metadata.deduplicated_class_distribution)}</p>
          <p><strong>Dataset SHA-256:</strong> <code className="break-all">{metadata.dataset_sha256}</code></p>
        </div>
        <p className="mt-4 rounded-lg bg-[#FFF3DC] p-3 text-sm text-[#6E7C73]">{metadata.small_unique_dataset_notice}</p>
        <p className="mt-2 text-xs text-[#6E7C73]">{metadata.model_selection_note} {metadata.validation_note}</p>
      </section>

      <section aria-labelledby="holdout-results">
        <div className="mb-3">
          <h2 id="holdout-results" className="text-lg font-bold text-[#26332B]">Holdout test evaluation</h2>
          <p className="text-xs text-[#6E7C73]">Metrics calculated from predictions on the single stratified test split. The test split is separate from cross-validation.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {modelEntries.map(([key, model]) => (
            <article className="card-base min-w-0 p-5" key={key}>
              <h3 className="text-base font-bold text-[#26332B]">{MODEL_LABELS[key] || key}</h3>
              <p className="mt-1 break-all text-xs text-[#6E7C73]">{model.python_class}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {Object.entries(model.holdout_metrics).map(([metric, value]) => (
                  <div key={metric} className="rounded-lg bg-[#F8FAF8] p-3">
                    <div className="text-[10px] font-bold uppercase text-[#6E7C73]">{METRIC_LABELS[metric] || metric}</div>
                    <div className="mt-1 text-lg font-extrabold text-[#216B45]">{percent(value)}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#6E7C73]">
                Fit time: {model.training_seconds.toFixed(4)} s · Prediction time: {model.prediction_seconds.toFixed(6)} s
              </p>
              <ConfusionMatrix labels={model.confusion_matrix.labels} matrix={model.confusion_matrix.matrix} />
              <ClassificationReport report={model.classification_report} />
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#216B45]">Model parameters</summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[#F8FAF8] p-3 text-[11px] text-[#26332B]">{JSON.stringify(model.model_parameters, null, 2)}</pre>
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className="card-base p-5" aria-labelledby="cross-validation-results">
        <h2 id="cross-validation-results" className="text-lg font-bold text-[#26332B]">Cross-validation on training partition</h2>
        <p className="mt-1 text-xs text-[#6E7C73]">Five-fold scores are descriptive variability estimates; they do not prove generalization and do not use the holdout test set.</p>
        <div className="mt-4 space-y-5">
          {modelEntries.map(([key, model]) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-bold text-[#26332B]">{MODEL_LABELS[key] || key}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead><tr className="border-b border-[#E4EAE6] text-[#6E7C73]"><th className="py-2 pr-3">Metric</th><th className="py-2 pr-3">Fold scores</th><th className="py-2 pr-3">Mean</th><th className="py-2">Std. dev.</th></tr></thead>
                  <tbody>
                    {Object.entries(model.cross_validation_on_training_partition).map(([metric, score]) => (
                      <tr className="border-b border-[#F1F3F1]" key={metric}>
                        <td className="py-2 pr-3 font-semibold">{METRIC_LABELS[metric] || metric}</td>
                        <td className="py-2 pr-3">{score.fold_scores.map((value) => value.toFixed(4)).join(', ')}</td>
                        <td className="py-2 pr-3">{score.mean.toFixed(4)}</td>
                        <td className="py-2">{score.std.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-bold uppercase tracking-wide text-[#6E7C73]">{label}</div>
    <div className="mt-1 break-words text-sm font-semibold text-[#26332B]">{value}</div>
  </div>
);

const ConfusionMatrix: React.FC<{ labels: string[]; matrix: number[][] }> = ({ labels, matrix }) => (
  <div className="mt-5">
    <h4 className="mb-2 text-sm font-bold text-[#26332B]">Holdout confusion matrix</h4>
    <p className="mb-2 text-[11px] text-[#6E7C73]">Rows: actual class · Columns: predicted class</p>
    <div className="overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead><tr><th className="p-2" />{labels.map((label) => <th className="p-2 capitalize" key={label}>{label}</th>)}</tr></thead>
        <tbody>{matrix.map((row, rowIndex) => (
          <tr key={labels[rowIndex]}><th className="p-2 text-left capitalize">{labels[rowIndex]}</th>{row.map((value, colIndex) => <td className="border border-white bg-[#E8F5EC] p-2 font-bold text-[#154E31]" key={`${rowIndex}-${colIndex}`}>{value}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  </div>
);

const ClassificationReport: React.FC<{ report: TrainingEvaluationData['models'][string]['classification_report'] }> = ({ report }) => {
  const rows = Object.entries(report).filter((entry): entry is [string, { precision: number; recall: number; 'f1-score'?: number; support: number }] => typeof entry[1] === 'object' && entry[1] !== null);
  const accuracy = report.accuracy;
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-semibold text-[#216B45]">Holdout classification report</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b border-[#E4EAE6] text-[#6E7C73]"><th className="py-2 pr-2">Class</th><th className="py-2 pr-2">Precision</th><th className="py-2 pr-2">Recall</th><th className="py-2 pr-2">F1</th><th className="py-2">Support</th></tr></thead>
          <tbody>{rows.map(([label, values]) => (
            <tr className="border-b border-[#F1F3F1]" key={label}>
              <td className="py-2 pr-2 capitalize">{label.replace(/_/g, ' ')}</td>
              <td className="py-2 pr-2">{values.precision.toFixed(3)}</td>
              <td className="py-2 pr-2">{values.recall.toFixed(3)}</td>
              <td className="py-2 pr-2">{(values['f1-score'] ?? 0).toFixed(3)}</td>
              <td className="py-2">{values.support}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {typeof accuracy === 'number' && <p className="mt-2 text-xs text-[#6E7C73]">Overall accuracy: {accuracy.toFixed(3)}</p>}
    </details>
  );
};

export default ModelTrainingPage;
