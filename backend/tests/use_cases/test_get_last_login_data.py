from unittest.mock import MagicMock

import pytest

from backend.app.use_cases import GetLastLoginData


@pytest.fixture
def mock_db_repo():
    # Create a MagicMock instance of the repository
    mock_repo = MagicMock()
    # Set up the mock method to return the expected result
    mock_repo.get_last_login_data.return_value = (
        ["age", "race"],
        {
            "race": ["Black", "Hispanic", "Mixed", "White"],
            "age": ["50-60", "20-30", "30-40", "40-50"],
        },
        "year",
    )
    return mock_repo


def test_get_last_login_data(mock_db_repo):
    # Arrange: Initialize the use case with the mocked repository
    use_case = GetLastLoginData(mock_db_repo)

    # Act: Execute the use case
    last_login_data = use_case.execute()

    # Assert: Verify the result matches the expected output
    assert last_login_data == (
        ["age", "race"],
        {
            "race": ["Black", "Hispanic", "Mixed", "White"],
            "age": ["50-60", "20-30", "30-40", "40-50"],
        },
        "year",
    )

    # Assert that the method was called once
    mock_db_repo.get_last_login_data.assert_called_once()
