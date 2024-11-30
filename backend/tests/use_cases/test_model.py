from unittest.mock import MagicMock, patch

import pandas as pd
import pytest
from ml_model.entities.datapoint_entity import (
    DataPoint,
)  # Make sure DataPoint is correctly imported
from ml_model.repository import data_point_creator_multiple, data_point_creator_single
from ml_model.repository.data_point_creator_multiple import MultiFeatureDataPointCreator
from ml_model.repository.data_point_creator_single import SingleFeatureDataPointCreator
from ml_model.use_cases.model import model
from ml_model.utility import model_util
from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier


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
    assert (
        len(clean_data_points) == 1
    ), "Expected only one valid data point after cleaning."


# Test create_bias_data_points_single function
def test_create_bias_data_points_single():
    """Test creating bias data points for a single feature."""
    metrics = pd.Series(
        {"accuracy": 0.85, "false_positive_rate": 0.1, "false_negative_rate": 0.1}
    )

    mappings = {"feature1": {1: "Label 1", 2: "Label 2"}}
    metric_frame = MagicMock(by_group=pd.DataFrame([metrics]))
    dp_creator = SingleFeatureDataPointCreator("feature1", mappings, metric_frame)
    data_points = dp_creator.data_point_list()
    assert len(data_points) == 1, "Expected one data point to be created."
    assert isinstance(data_points[0], DataPoint), "Expected DataPoint object."


# Test single_column_datapoint function
def test_single_column_datapoint():
    """Test the creation of a single column data point."""
    metrics = pd.Series(
        {"accuracy": 0.85, "false_positive_rate": 0.1, "false_negative_rate": 0.1}
    )

    f1_label = "Feature 1 Label"

    data_point = data_point_creator_single.datapoint_creator(metrics, f1_label)
    assert isinstance(data_point, DataPoint), "Expected DataPoint object."


# Test multiple_column_datapoint function
def test_multiple_column_datapoint():
    """Test the creation of a multiple column data point."""
    metrics = pd.Series(
        {"accuracy": 0.85, "false_positive_rate": 0.1, "false_negative_rate": 0.1}
    )
    mappings = {}
    f1_label = "Feature 1 Label"
    feature2_code = 1
    inputs = pd.DataFrame({"feature1": [1, 2], "feature2": [3, 4]})

    data_point = data_point_creator_multiple.datapoint_creator(
        metrics, f1_label, mappings, feature2_code, inputs
    )
    assert isinstance(data_point, DataPoint), "Expected DataPoint object."


@pytest.fixture
def mock_data():
    # Example mock data
    data = {
        "customer_id": [1, 2],
        "gender": ["male", "female"],
        "age": [25, 30],
        "race": ["asian", "black"],
        "state": ["NY", "CA"],
        "zip_code": [12345, 67890],
        "timestamp": ["2021-01-01", "2021-02-01"],
        "action_status": [1, 0],
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_file_reader(mock_data):
    # Mock the FileReader behavior
    mock_reader = MagicMock()
    mock_reader.read_file.return_value = (
        mock_data,
        mock_data[["gender", "age"]],
        mock_data["action_status"],
    )
    mock_reader.single_column_check = False  # Simulate multiple columns
    return mock_reader


@pytest.fixture
def mock_data_processor(mock_data):
    # Mock the DataProcessor behavior
    mock_processor = MagicMock()
    mock_processor.encode_categorical_columns.return_value = mock_data
    mock_processor.get_mappings.return_value = {
        "gender": {"male": 0, "female": 1},
        "race": {"asian": 0, "black": 1},
    }
    mock_processor.drop_categorical_columns.return_value = mock_data.drop(
        columns=["gender", "race"]
    )
    return mock_processor


@pytest.fixture
def mock_safe_train_test_split():
    # Mock the train-test split behavior
    with patch(
        "ml_model.repository.safe_train_grid.safe_train_test_split"
    ) as mock_split:
        mock_split.return_value = (
            pd.DataFrame(),
            pd.DataFrame(),
            pd.Series(),
            pd.Series(),
        )
        yield mock_split


@pytest.fixture
def mock_safe_grid_search():
    # Mock the grid search behavior
    with patch("ml_model.repository.safe_train_grid.safe_grid_search") as mock_search:
        clf = MagicMock(spec=DecisionTreeClassifier)
        mock_search.return_value = clf
        yield mock_search


@pytest.fixture
def mock_fairness_evaluator():
    # Mock the FairnessEvaluator behavior
    mock_evaluator = MagicMock()
    mock_evaluator.evaluate_fairness.return_value = MagicMock(
        by_group=pd.DataFrame({"accuracy": [0.9, 0.85, 0.88]})
    )
    return mock_evaluator


@pytest.fixture
def mock_save_model():
    # Mock the save_model behavior
    with patch("ml_model.repository.model_saver.save_model") as mock_save:
        yield mock_save


@pytest.fixture
def mock_data_point_creator():
    # Mock the DataPointCreator behavior
    with patch(
        "ml_model.repository.data_point_creator_multiple.MultiFeatureDataPointCreator"
    ) as mock_creator:
        dp_creator = MagicMock()
        dp_creator.data_point_list.return_value = [{"feature": "gender", "value": 0}]
        mock_creator.return_value = dp_creator
        yield mock_creator


@patch("ml_model.repository.file_reader.FileReader", new_callable=MagicMock)
@patch("ml_model.repository.data_preprocessing.DataProcessor", new_callable=MagicMock)
@patch("ml_model.repository.safe_train_grid.safe_train_test_split")
@patch("ml_model.repository.safe_train_grid.safe_grid_search")
@patch("ml_model.repository.fairness.FairnessEvaluator", new_callable=MagicMock)
@patch("ml_model.repository.model_saver.save_model", new_callable=MagicMock)
@patch(
    "ml_model.repository.data_point_creator_multiple.MultiFeatureDataPointCreator",
    new_callable=MagicMock,
)
def test_model(
    mock_data_point_creator,
    mock_save_model,
    mock_fairness_evaluator,
    mock_safe_grid_search,
    mock_safe_train_test_split,
    mock_data_processor,
    mock_file_reader,
    mock_data,
):
    # Arrange: Mock the FileReader
    mock_file_reader.read_file.return_value = (
        mock_data,
        mock_data[["gender", "age"]],
        mock_data["action_status"],
    )
    mock_file_reader.single_column_check = False  # Multiple columns case

    # Arrange: Mock the DataProcessor
    mock_data_processor.encode_categorical_columns.return_value = mock_data
    mock_data_processor.get_mappings.return_value = {
        "gender": {"male": 0, "female": 1},
        "race": {"asian": 0, "black": 1},
    }
    mock_data_processor.drop_categorical_columns.return_value = mock_data.drop(
        columns=["gender", "race"]
    )

    # Arrange: Mock the train-test split and grid search
    mock_safe_train_test_split.return_value = (
        mock_data[["age", "race"]],
        mock_data[["age", "race"]],
        mock_data["action_status"],
        mock_data["action_status"],
    )
    mock_safe_grid_search.return_value = MagicMock(spec=DecisionTreeClassifier)

    # Arrange: Mock the fairness evaluator
    mock_fairness_evaluator.evaluate_fairness.return_value = MagicMock(
        by_group=pd.DataFrame({"accuracy": [0.9, 0.85, 0.88]})
    )

    # Arrange: Mock the data point creator
    mock_data_point_creator.return_value.data_point_list.return_value = [
        {"feature": "gender", "value": 0}
    ]

    # Act: Call the model function
    result = model()

    # Assert: Ensure the result is as expected
    assert isinstance(result, list)  # We expect a list of data points
    assert len(result) > 0  # The list should have data points
