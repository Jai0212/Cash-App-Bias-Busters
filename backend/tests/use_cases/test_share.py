import base64
import json
from unittest.mock import MagicMock

import pytest

from backend.app.repositories.user_repo import UserRepo
from backend.app.use_cases.share import Share


@pytest.fixture
def mock_user_repo():
    return MagicMock(spec=UserRepo)


def test_share_success(mock_user_repo):
    # Arrange
    data = {"key": "value", "user_id": 123}
    encoded_data = base64.b64encode(json.dumps(data).encode("utf-8")).decode("utf-8")
    mock_user_repo.process_shared_data.return_value = data

    share_use_case = Share(user_repo=mock_user_repo, encoded_data=encoded_data)

    # Act
    result = share_use_case.execute()

    # Assert
    assert result == data
    mock_user_repo.process_shared_data.assert_called_once_with(encoded_data)


def test_share_invalid_base64_encoding(mock_user_repo):
    # Arrange
    invalid_encoded_data = "not_base64_encoded_string"
    mock_user_repo.process_shared_data.side_effect = ValueError(
        "Invalid encoded data: Incorrect padding"
    )

    share_use_case = Share(user_repo=mock_user_repo, encoded_data=invalid_encoded_data)

    # Act & Assert
    with pytest.raises(ValueError) as exc_info:
        share_use_case.execute()

    assert "Invalid encoded data: Incorrect padding" in str(exc_info.value)
    mock_user_repo.process_shared_data.assert_called_once_with(invalid_encoded_data)


def test_share_invalid_json(mock_user_repo):
    # Arrange
    invalid_json_data = base64.b64encode(b"{invalid_json}").decode("utf-8")
    mock_user_repo.process_shared_data.side_effect = ValueError(
        "Invalid encoded data: Expecting property name"
    )

    share_use_case = Share(user_repo=mock_user_repo, encoded_data=invalid_json_data)

    # Act & Assert
    with pytest.raises(ValueError) as exc_info:
        share_use_case.execute()

    assert "Invalid encoded data: Expecting property name" in str(exc_info.value)
    mock_user_repo.process_shared_data.assert_called_once_with(invalid_json_data)


def test_share_empty_encoded_data(mock_user_repo):
    # Arrange
    empty_encoded_data = ""
    mock_user_repo.process_shared_data.side_effect = ValueError(
        "Invalid encoded data: Incorrect padding"
    )

    share_use_case = Share(user_repo=mock_user_repo, encoded_data=empty_encoded_data)

    # Act & Assert
    with pytest.raises(ValueError) as exc_info:
        share_use_case.execute()

    assert "Invalid encoded data: Incorrect padding" in str(exc_info.value)
    mock_user_repo.process_shared_data.assert_called_once_with(empty_encoded_data)
