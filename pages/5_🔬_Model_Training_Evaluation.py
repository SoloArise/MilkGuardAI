"""Display the generated, shared model comparison evaluation report."""

import pandas as pd
import streamlit as st

from config.settings import APP_NAME
from src.analytics import get_training_evaluation_metrics
from src.ui_components import apply_custom_theme, render_page_header, render_sidebar


st.set_page_config(
    page_title=f"{APP_NAME} - Model Training & Evaluation",
    page_icon="🔬",
    layout="wide",
)

apply_custom_theme()
render_sidebar()
render_page_header(
    eyebrow="GENERATED ML EVALUATION",
    title="Model Training & Evaluation",
    subtitle="Holdout evaluation and training-partition cross-validation results for the same generated model comparison.",
)

try:
    evaluation = get_training_evaluation_metrics()
except (FileNotFoundError, ValueError) as exc:
    st.error(f"Evaluation results are unavailable: {exc}")
    st.info("Generate the evaluation report by running `python scripts/train_evaluate.py` from the project root.")
    st.stop()

metadata = evaluation["metadata"]
models = evaluation["models"]
model_titles = {
    "random_forest": "Random Forest",
    "gaussian_nb": "Gaussian Naive Bayes",
    "svm": "Support Vector Machine (SVM)",
}
metric_titles = {
    "accuracy": "Accuracy",
    "balanced_accuracy": "Balanced accuracy",
    "macro_precision": "Macro precision",
    "macro_recall": "Macro recall",
    "macro_f1": "Macro F1",
}

st.subheader("Dataset and evaluation metadata")
meta_cols = st.columns(4)
meta_cols[0].metric("Dataset", metadata["dataset_filename"])
meta_cols[1].metric("Original rows", metadata["original_sample_count"])
meta_cols[2].metric("Duplicates removed", metadata["duplicate_rows_removed"])
meta_cols[3].metric("Unique rows", metadata["deduplicated_sample_count"])

meta_cols = st.columns(4)
meta_cols[0].metric("Training samples", metadata["training_sample_count"])
meta_cols[1].metric("Holdout samples", metadata["testing_sample_count"])
meta_cols[2].metric("Random seed", metadata["random_seed"])
meta_cols[3].metric("Evaluation date (UTC)", metadata["evaluation_timestamp_utc"])

with st.expander("Dataset details and reproducibility metadata", expanded=False):
    st.write("**Original class distribution**")
    st.json(metadata["original_class_distribution"])
    st.write("**Deduplicated class distribution**")
    st.json(metadata["deduplicated_class_distribution"])
    st.write("**Training class distribution**")
    st.json(metadata["training_class_distribution"])
    st.write("**Holdout class distribution**")
    st.json(metadata["testing_class_distribution"])
    st.write(f"**Dataset SHA-256:** `{metadata['dataset_sha256']}`")
    st.write(f"**Python:** {metadata['python_version']} · **scikit-learn:** {metadata['scikit_learn_version']}")
    st.write(f"**Holdout split:** {metadata['train_test_split']}")
    st.write(f"**Cross-validation:** {metadata['cross_validation']}")

st.warning(metadata["small_unique_dataset_notice"])
st.caption(f"{metadata['model_selection_note']} {metadata['validation_note']}")

st.markdown("---")
st.header("Holdout test evaluation")
st.caption(
    "Metrics and reports below are computed from the single held-out test split. "
    "They are distinct from the cross-validation scores shown separately below."
)

for model_key, model in models.items():
    st.subheader(model_titles.get(model_key, model_key))
    st.caption(model["python_class"])
    metric_cols = st.columns(len(model["holdout_metrics"]))
    for column, (metric_key, value) in zip(metric_cols, model["holdout_metrics"].items()):
        column.metric(metric_titles.get(metric_key, metric_key), f"{value:.2%}")
    st.caption(
        f"Training time: {model['training_seconds']:.4f} s · "
        f"Prediction time: {model['prediction_seconds']:.6f} s"
    )

    matrix_data = model["confusion_matrix"]
    labels = matrix_data["labels"]
    matrix_frame = pd.DataFrame(matrix_data["matrix"], index=labels, columns=labels)
    matrix_frame.index.name = "Actual class"
    matrix_frame.columns.name = "Predicted class"
    st.write("**Holdout confusion matrix** · rows are actual classes; columns are predicted classes")
    st.dataframe(matrix_frame, use_container_width=True)

    report_rows = {
        label: values
        for label, values in model["classification_report"].items()
        if isinstance(values, dict)
    }
    report_frame = pd.DataFrame.from_dict(report_rows, orient="index")
    st.write("**Holdout classification report**")
    if isinstance(model["classification_report"].get("accuracy"), (int, float)):
        st.caption(f"Overall accuracy: {model['classification_report']['accuracy']:.4f}")
    st.dataframe(report_frame, use_container_width=True)

    with st.expander(f"{model_titles.get(model_key, model_key)} model parameters"):
        st.json(model["model_parameters"])

st.markdown("---")
st.header("Cross-validation on training partition")
st.caption(
    "These five-fold scores use only the training partition. They describe variation across folds; "
    "they do not prove generalization and do not replace the separate holdout evaluation."
)

for model_key, model in models.items():
    st.subheader(model_titles.get(model_key, model_key))
    cv_rows = []
    for metric_key, score in model["cross_validation_on_training_partition"].items():
        cv_rows.append(
            {
                "Metric": metric_titles.get(metric_key, metric_key),
                "Fold scores": ", ".join(f"{value:.4f}" for value in score["fold_scores"]),
                "Mean": score["mean"],
                "Standard deviation": score["std"],
            }
        )
    st.dataframe(pd.DataFrame(cv_rows), hide_index=True, use_container_width=True)
