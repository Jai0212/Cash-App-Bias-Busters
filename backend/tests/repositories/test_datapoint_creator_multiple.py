import pytest
import pandas as pd
import numpy as np
from fairlearn.metrics import MetricFrame
from ml_model.utility import model_util
from ml_model.entities.datapoint_entity import DataPoint
from ml_model.repository.data_point_creator_multiple import MultiFeatureDataPointCreator


# Mock for model_util methods used in the class
class MockModelUtil:
    @staticmethod
    def get_mapped_label(mappings, feature, code):
        return f"{feature}_{code}"

    @staticmethod
    def get_rounded_metrics(metrics):
        return [round(metrics[0], 2), round(metrics[1], 2), round(metrics[2], 2)]

    @staticmethod
    def is_nan_in_datapoint(data_point):
        return False


# Mocking the utility functions used in MultiFeatureDataPointCreator
model_util.get_mapped_label = MockModelUtil.get_mapped_label
model_util.get_rounded_metrics = MockModelUtil.get_rounded_metrics
model_util.is_nan_in_datapoint = MockModelUtil.is_nan_in_datapoint


# Fixtures for DataFrame and MetricFrame
@pytest.fixture
def mock_inputs():
    return pd.DataFrame({
        'feature1': [1, 2],
        'feature2': [3, 4]
    })


@pytest.fixture
def mock_metric_frame():
    # Sample data for MetricFrame
    y_true = np.array([1, 0, 1, 0])
    y_pred = np.array([1, 0, 0, 0])
    sensitive_features = np.array(["group1", "group1", "group2", "group2"])

    # Define metric functions
    metrics = {
        'accuracy': lambda y_true, y_pred: np.mean(y_true == y_pred),
        'falsepositive': lambda y_true, y_pred: np.sum((y_pred == 1) & (y_true == 0)) / np.sum(y_true == 0),
        'falsenegative': lambda y_true, y_pred: np.sum((y_pred == 0) & (y_true == 1)) / np.sum(y_true == 1),
    }

    # Construct the MetricFrame object
    return MetricFrame(
        metrics=metrics,
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sensitive_features
    )


# Test Initialization
def test_initialization(mock_inputs, mock_metric_frame):
    creator = MultiFeatureDataPointCreator("feature1", {"label_1": "mapped_1"},
                                           mock_metric_frame, mock_inputs)
    assert creator.feature1 == "feature1"
    assert creator.mappings == {"label_1": "mapped_1"}
    assert creator.metric_frame == mock_metric_frame
    assert creator.inputs.equals(mock_inputs)
