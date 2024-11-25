import pytest
import pandas as pd
from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from unittest.mock import patch, MagicMock
import sys
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)
from ml_model.entities.datapoint_entity import DataPoint  # Make sure DataPoint is correctly imported
from ml_model.repository.data_point_creator_single import SingleFeatureDataPointCreator
from ml_model.repository.data_point_creator_multiple import MultiFeatureDataPointCreator
from ml_model.repository import data_point_creator_single
from ml_model.repository import data_point_creator_multiple
from ml_model.utility import model_util


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

    clean_data_points = model_util.clean_datapoints(MockFileReader(), data_points)
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
    dp_creator = SingleFeatureDataPointCreator("feature1", mappings, metric_frame)
    data_points = dp_creator.data_point_list()
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

    f1_label = "Feature 1 Label"

    data_point = data_point_creator_single.datapoint_creator(metrics, f1_label)
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

    data_point = data_point_creator_multiple.datapoint_creator(metrics, f1_label, mappings, feature2_code, inputs)
    assert isinstance(data_point, DataPoint), "Expected DataPoint object."
