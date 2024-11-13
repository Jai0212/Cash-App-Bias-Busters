import pytest
import os
from unittest.mock import MagicMock
from app.use_cases import GetValuesUnderHeader
from app.repositories.interfaces import FileRepository


@pytest.fixture
def mock_file_repo():
    # Create a MagicMock instance of the FileRepository
    mock_repo = MagicMock()

    # Mock get_headers to return the list of column headers
    mock_repo.get_headers.return_value = ["gender", "age", "race", "state"]

    curr_dir = os.path.dirname(__file__)
    mock_repo.file_path = os.path.join(curr_dir, "../../../database/output.csv")

    # You can mock other methods like save_data_to_csv or delete_csv_data if necessary
    return mock_repo


def test_get_values_under_header(mock_file_repo):
    # Arrange
    header = "race"
    use_case = GetValuesUnderHeader(mock_file_repo)

    # Act
    result = use_case.execute(header)

    # Assert
    assert result == ["Black", "Hispanic", "Other"]

    # Verify that save_data_to_csv and delete_csv_data were called
    mock_file_repo.save_data_to_csv.assert_called_once()
    mock_file_repo.delete_csv_data.assert_called_once()
