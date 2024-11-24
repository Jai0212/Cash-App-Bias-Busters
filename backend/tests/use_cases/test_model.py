import pytest
import pandas as pd
from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from unittest.mock import patch, MagicMock
from ml_model.use_cases.model import (
    grid_search,
    clean_datapoints,
    is_nan_in_datapoint,
    create_bias_data_points_single,
    create_bias_data_points_multiple,
    single_column_datapoint,
    multiple_column_datapoint
)
from ml_model.entities.datapoint_entity import DataPoint  # Make sure DataPoint is correctly imported


# Test clean_datapoints function
def test_clean_datapoints_valid():
    """Test that clean_datapoints removes NaN values correctly."""
    # Mock FileReader
    class MockFileReader:
        single_column_check = False

    data_points = [
        MagicMock(feature1=1, feature2=2),
        MagicMock(feature1="NaN", feature2=2),
        MagicMock(feature1=3, feature2="NaN"),
    ]

    clean_data_points = clean_datapoints(MockFileReader(), data_points)
    assert len(clean_data_points) == 1, "Expected only one valid data point after cleaning."


# Test create_bias_data_points_single function
def test_create_bias_data_points_single():
    """Test creating bias data points for a single feature."""
    metrics = pd.Series({
        'accuracy': 0.85,
        'false_positive_rate': 0.1,
        'false_negative_rate': 0.1
    })

    mappings = {'feature1': {1: "Label 1", 2: "Label 2"}}
    metric_frame = MagicMock(by_group=pd.DataFrame([metrics]))

    data_points = create_bias_data_points_single("feature1", mappings, metric_frame)
    assert len(data_points) == 1, "Expected one data point to be created."
    assert isinstance(data_points[0], DataPoint), "Expected DataPoint object."


# Test single_column_datapoint function
def test_single_column_datapoint():
    """Test the creation of a single column data point."""
    metrics = pd.Series({
        'accuracy': 0.85,
        'false_positive_rate': 0.1,
        'false_negative_rate': 0.1
    })
    mappings = {}
    f1_label = "Feature 1 Label"

    data_point = single_column_datapoint(metrics, mappings, f1_label)
    assert isinstance(data_point, DataPoint), "Expected DataPoint object."


# Test multiple_column_datapoint function
def test_multiple_column_datapoint():
    """Test the creation of a multiple column data point."""
    metrics = pd.Series({
        'accuracy': 0.85,
        'false_positive_rate': 0.1,
        'false_negative_rate': 0.1
    })
    mappings = {}
    f1_label = "Feature 1 Label"
    feature2_code = 1
    inputs = pd.DataFrame({'feature1': [1, 2], 'feature2': [3, 4]})

    data_point = multiple_column_datapoint(metrics, f1_label, mappings, feature2_code, inputs)
    assert isinstance(data_point, DataPoint), "Expected DataPoint object."
