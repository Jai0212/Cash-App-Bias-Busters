from unittest.mock import MagicMock

import pytest

from backend.app.use_cases import GetHeaders


def test_get_headers_success():
    # Arrange
    mock_file_repo = MagicMock()
    mock_file_repo.get_headers.return_value = ["gender", "age", "race", "state"]
    get_headers_use_case = GetHeaders(file_repo=mock_file_repo)

    # Act
    headers = get_headers_use_case.execute()

    # Assert
    assert headers == ["gender", "age", "race", "state"]
    mock_file_repo.get_headers.assert_called_once()


def test_get_headers_no_headers():
    # Arrange
    mock_file_repo = MagicMock()
    mock_file_repo.get_headers.return_value = []
    get_headers_use_case = GetHeaders(file_repo=mock_file_repo)

    # Act
    headers = get_headers_use_case.execute()

    # Assert
    assert headers == []
    mock_file_repo.get_headers.assert_called_once()


def test_get_headers_exception_handling():
    # Arrange
    mock_file_repo = MagicMock()
    mock_file_repo.get_headers.side_effect = Exception("Database error")
    get_headers_use_case = GetHeaders(file_repo=mock_file_repo)

    # Act
    headers = get_headers_use_case.execute()

    # Assert
    assert headers == []
    mock_file_repo.get_headers.assert_called_once()
