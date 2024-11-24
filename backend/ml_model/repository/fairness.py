from fairlearn.metrics import MetricFrame
import numpy as np


class FairnessEvaluator:
    """
    A class to evaluate the fairness of model predictions based on sensitive features.
    """

    def __init__(self, y_true, y_pred, sensitive_features):
        """
        Initializes the FairnessEvaluator with true labels, predictions, and sensitive features.

        Args:
            y_true (array-like): True labels.
            y_pred (array-like): Model predictions.
            sensitive_features (array-like): Sensitive features for fairness evaluation.
        """
        self.y_true = y_true
        self.y_pred = y_pred
        self.sensitive_features = sensitive_features

    def evaluate_fairness(self) -> MetricFrame:
        """
        Evaluates fairness of the model's predictions and returns a MetricFrame
        object with fairness metrics.

        Returns:
            MetricFrame: A MetricFrame object containing accuracy,
            false positive rate, and false negative rate metrics.
        """

        metric_frame = MetricFrame(
            metrics={
                "accuracy": lambda y_true, y_pred: np.mean(y_true == y_pred),
                "false_positive_rate": lambda y_true, y_pred: np.mean((y_true == 0) & (y_pred == 1)),
                "false_negative_rate": lambda y_true, y_pred: np.mean((y_true == 1) & (y_pred == 0)),
            },
            y_true=self.y_true,
            y_pred=self.y_pred,
            sensitive_features=self.sensitive_features,)

        return metric_frame
