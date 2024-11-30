import os
from unittest.mock import MagicMock

import pytest

from backend.app.use_cases import UploadData


@pytest.fixture
def mock_file_repo():
    # Mock the file repository and its method
    mock_repo = MagicMock()
    mock_repo.import_csv_to_db.return_value = True
    return mock_repo


def test_upload_data(mock_file_repo):
    curr_dir = os.path.dirname(__file__)
    # Arrange: Mock the file path and set up mock behavior.
    test_file_path = os.path.join(curr_dir, "../../../database/test.csv")

    # Create an instance of the use case with the mock repo
    use_case = UploadData(mock_file_repo)

    # Act: Execute the use case with the test file path.
    result = use_case.execute(test_file_path)

    # Assert: Check if data upload was successful.
    assert result is True
    mock_file_repo.import_csv_to_db.assert_called_once_with(test_file_path)
