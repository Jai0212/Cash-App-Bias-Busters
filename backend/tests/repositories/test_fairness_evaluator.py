import numpy as np
import pytest
from fairlearn.metrics import MetricFrame
from ml_model.repository.fairness import FairnessEvaluator


@pytest.fixture
def test_data():
    """Fixture to provide sample data for testing."""
    y_true = np.array([1, 0, 1, 0, 1])
    y_pred = np.array([1, 0, 0, 0, 1])
    sensitive_features = np.array(["A", "B", "A", "B", "A"])
    return y_true, y_pred, sensitive_features


def test_evaluate_fairness(test_data):
    """Test the evaluate_fairness method for expected outputs."""
    y_true, y_pred, sensitive_features = test_data
    evaluator = FairnessEvaluator(y_true, y_pred, sensitive_features)

    metric_frame = evaluator.evaluate_fairness()

    # Check if the returned object is a MetricFrame
    assert isinstance(
        metric_frame, MetricFrame
    ), "Returned object is not a MetricFrame."

    # Validate the calculated metrics
    overall_accuracy = np.mean(y_true == y_pred)
    overall_fpr = np.mean((y_true == 0) & (y_pred == 1))
    overall_fnr = np.mean((y_true == 1) & (y_pred == 0))

    assert (
        metric_frame.overall["accuracy"] == overall_accuracy
    ), "Accuracy does not match expected value."
    assert (
        metric_frame.overall["false_positive_rate"] == overall_fpr
    ), "False positive rate does not match expected value."
    assert (
        metric_frame.overall["false_negative_rate"] == overall_fnr
    ), "False negative rate does not match expected value."


def test_sensitive_feature_disparity(test_data):
    """Test the evaluate_fairness method for sensitive feature disparity."""
    y_true, y_pred, sensitive_features = test_data
    evaluator = FairnessEvaluator(y_true, y_pred, sensitive_features)

    metric_frame = evaluator.evaluate_fairness()

    # Check metrics per sensitive feature group
    group_metrics = metric_frame.by_group
    assert "A" in group_metrics.index, "Group 'A' metrics missing."
    assert "B" in group_metrics.index, "Group 'B' metrics missing."

    # Example assertions for group-specific metrics
    group_A_mask = sensitive_features == "A"
    accuracy_A = np.mean(y_true[group_A_mask] == y_pred[group_A_mask])
    assert (
        group_metrics.loc["A"]["accuracy"] == accuracy_A
    ), "Accuracy for group 'A' does not match expected value."


def test_mismatched_input_lengths():
    """Test evaluate_fairness with mismatched input lengths."""
    y_true = np.array([1, 0, 1])
    y_pred = np.array([1, 0])
    sensitive_features = np.array(["A", "B", "A"])

    evaluator = FairnessEvaluator(y_true, y_pred, sensitive_features)
    with pytest.raises(ValueError):
        evaluator.evaluate_fairness()
