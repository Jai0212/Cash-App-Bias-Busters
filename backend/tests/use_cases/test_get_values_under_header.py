import pytest
import pandas as pd
import os
from unittest.mock import MagicMock, patch
from app.use_cases import GetValuesUnderHeader


@pytest.fixture
def mock_file_repo():
    # Create a MagicMock instance of the FileRepository
    mock_repo = MagicMock()
    mock_repo.get_headers.return_value = ["gender", "age", "race", "state"]
    curr_dir = os.path.dirname(__file__)
    mock_repo.file_path = os.path.join(curr_dir, "../../../database/output.csv")
    return mock_repo


@patch("pandas.read_csv")
def test_get_values_under_header_race(mock_read_csv, mock_file_repo):
    # Arrange
    header = "race"
    mock_read_csv.return_value = pd.DataFrame({"race": ["Black", "Hispanic", "Other"]})
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert result == ["Black", "Hispanic", "Other"]
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()


@patch("pandas.read_csv")
def test_get_values_under_header_age_ranges(mock_read_csv, mock_file_repo):
    # Arrange
    header = "age"
    mock_read_csv.return_value = pd.DataFrame({"age": [18, 30, 40, 50, 60, 70, 80]})
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert set(result) == {
        "18-26",
        "27-35",
        "36-44",
        "45-53",
        "54-62",
        "63-71",
        "72-80",
    }
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()


@patch("pandas.read_csv")
def test_get_values_under_header_no_such_header(mock_read_csv, mock_file_repo):
    # Arrange
    header = "non_existent_header"
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert result == []
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()


@patch("pandas.read_csv")
def test_get_values_under_header_with_nan_values(mock_read_csv, mock_file_repo):
    # Arrange
    header = "race"
    mock_read_csv.return_value = pd.DataFrame(
        {"race": ["Black", None, "Other", "Hispanic"]}
    )
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert result == ["Black", "Other", "Hispanic"]
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()


@patch("pandas.read_csv")
def test_get_values_under_header_exception_handling(mock_read_csv, mock_file_repo):
    # Arrange
    header = "gender"
    mock_read_csv.side_effect = Exception("Read CSV failed")
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert result == []
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()
