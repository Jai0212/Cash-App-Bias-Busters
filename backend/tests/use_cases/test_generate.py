# tests/use_cases/test_generate.py
from backend.ml_model.entities.datapoint_entity import (
    DataPoint,
)  # Ensure this import is correct based on your structure

from backend.app.use_cases import Generate


def test_generate(mock_file_repo, mock_db_repo):
    # Arrange
    demographics = ["race", "gender"]
    choices = {
        "race": ["Black", "Other", "Hispanic", ""],
        "gender": ["Non-binary", "Male", "Female", ""],
    }
    time = "year"

    # Create a list of mock DataPoint objects to simulate the return value
    mock_data_points = [
        DataPoint("gender_0", "race_0", 0.25, 0.75, 0.0),
        DataPoint("gender_0", "race_1", 0.33, 0.67, 0.0),
        DataPoint("gender_0", "race_2", 0.67, 0.0, 0.33),
        DataPoint("gender_1", "race_0", 0.0, 0.0, 1.0),
        DataPoint("gender_1", "race_1", 0.5, 0.0, 0.5),
        DataPoint("gender_1", "race_2", 0.75, 0.25, 0.0),
        DataPoint("gender_2", "race_0", 0.5, 0.0, 0.5),
        DataPoint("gender_2", "race_1", 1.0, 0.0, 0.0),
        DataPoint("gender_2", "race_2", 0.0, 0.0, 1.0),
    ]

    # Act
    use_case = Generate(mock_file_repo, mock_db_repo)
    result = use_case.execute(demographics, choices, time)
    # Assert
    assert isinstance(result, list)  # Check that result is a list
    assert len(result) == len(
        mock_data_points
    )  # Check that it returns the correct number of DataPoint objects
    assert all(
        isinstance(item, DataPoint) for item in result
    )  # Ensure each item is a DataPoint instance
    print("JJ DEBUG")
    for i in result:
        print(
            i.get_feature1(),
            i.get_feature2(),
            i.get_accuracy(),
            i.get_false_positive_rate(),
            i.get_false_negative_rate(),
            i.get_combination_label(),
        )
    # Compare each individual DataPoint value
    for i, item in enumerate(result):
        # Assert feature1 and feature2 are correct
        assert (
            item.get_feature1() == mock_data_points[i].get_feature1()
        ), f"Failed at index {i}: feature1 mismatch"
        assert (
            item.get_feature2() == mock_data_points[i].get_feature2()
        ), f"Failed at index {i}: feature2 mismatch"

        # Assert accuracy, false positive, and false negative are correct
        assert (
            item.get_accuracy() == mock_data_points[i].get_accuracy()
        ), f"Failed at index {i}: accuracy mismatch"
        assert (
            item.get_false_positive_rate()
            == mock_data_points[i].get_false_positive_rate()
        ), f"Failed at index {i}: false positive mismatch"
        assert (
            item.get_false_negative_rate()
            == mock_data_points[i].get_false_negative_rate()
        ), f"Failed at index {i}: false negative mismatch"
