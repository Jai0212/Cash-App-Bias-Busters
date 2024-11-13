import pytest
from app.use_cases import GetHeaders
from unittest.mock import MagicMock


def test_get_headers(mock_file_repo):
    # Arrange: Set up the mock to return a sample header list.
    mock_file_repo = MagicMock()
    mock_file_repo.get_headers.return_value = ["gender", "age", "race", "state"]

    # Act: Call the method
    headers = mock_file_repo.get_headers()

    # Assert: Check that the return value is as expected
    assert headers == ["gender", "age", "race", "state"]
