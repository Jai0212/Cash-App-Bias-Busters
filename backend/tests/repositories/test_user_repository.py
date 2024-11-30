import base64
from unittest.mock import MagicMock, patch

import pytest
from mysql.connector import Error

from backend.app.repositories.user_repo import UserRepo


@pytest.fixture
def mock_db_connection():
    # Mock the DbConnectionManager's get_connection method
    with patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection"
    ) as mock_get_conn:
        mock_connection = MagicMock()
        mock_get_conn.return_value = mock_connection
        yield mock_connection


@pytest.fixture
def user_repository(mock_db_connection):
    return UserRepo(table_name="users")


def test_get_user_by_email_success(user_repository, mock_db_connection):

    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = {
        "email": "john.doe@example.com",
        "firstname": "John",
        "lastname": "Doe",
    }

    result = user_repository.get_user_by_email("john.doe@example.com")

    assert result == {
        "email": "john.doe@example.com",
        "firstname": "John",
        "lastname": "Doe",
    }
    mock_db_connection.cursor.assert_called_once()


def test_get_user_by_email_not_found(user_repository, mock_db_connection):

    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = None

    result = user_repository.get_user_by_email("nonexistent@example.com")

    assert result is None


def test_get_user_by_email_query_failure(user_repository, mock_db_connection):

    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Error("Query failed")
    mock_db_connection.cursor.return_value = mock_cursor

    result = user_repository.get_user_by_email("error@example.com")

    assert result is None


def test_get_user_by_email_and_password_error_handling(
    user_repository, mock_db_connection
):
    # Arrange
    email = "user@example.com"
    password = "incorrect_password"

    # Mock the cursor to raise an error when execute is called
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.execute.side_effect = Error(
        "Database error"
    )  # Simulate a database error

    # Act
    result = user_repository.get_user_by_email_and_password(email, password)

    # Assert
    assert result is None  # Verify that None is returned when an error occurs
    mock_cursor.execute.assert_called_once_with(  # Ensure the execute method was called with correct parameters
        "SELECT * FROM users WHERE email = %s AND password = %s", (email, password)
    )


def test_create_user_success(user_repository, mock_db_connection):
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor

    user_repository.create_user("John", "Doe", "john.doe@example.com", "password123")

    mock_cursor.execute.assert_called_once()
    mock_db_connection.commit.assert_called_once()


def test_create_user_query_failure(user_repository, mock_db_connection):

    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Error("Insert query failed")
    mock_db_connection.cursor.return_value = mock_cursor

    user_repository.create_user("John", "Doe", "error@example.com", "password123")

    mock_cursor.execute.assert_called_once()
    mock_db_connection.commit.assert_not_called()


def test_update_password_failure(user_repository, mock_db_connection):
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = Error("Update query failed")
    mock_db_connection.cursor.return_value = mock_cursor

    user_repository.update_password("error@example.com", "newpassword123")

    mock_cursor.execute.assert_called_once()
    mock_db_connection.commit.assert_not_called()


def test_process_shared_data_success(user_repository):

    valid_data = base64.b64encode(b'{"key": "value"}').decode("utf-8")

    result = user_repository.process_shared_data(valid_data)

    assert result == {"key": "value"}


def test_process_shared_data_invalid(user_repository):

    invalid_data = "invalid_base64"

    # Test processing with invalid data
    with pytest.raises(ValueError, match="Invalid encoded data"):
        user_repository.process_shared_data(invalid_data)


def test_get_user_by_email_connection_failure(user_repository):

    with patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection",
        return_value=None,
    ):

        result = user_repository.get_user_by_email("nonexistent@example.com")

        assert result is None


def test_get_user_by_email_and_password_connection_failure_with_output(
    user_repository, capsys
):

    with patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection",
        return_value=None,
    ):
        result = user_repository.get_user_by_email_and_password(
            "user@example.com", "password123"
        )

        captured = capsys.readouterr()

        assert result is None

        assert "Not connected to the database." in captured.out


def test_update_password_connection_failure(user_repository):

    with patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection",
        return_value=None,
    ):
        with patch("builtins.print") as mock_print:
            user_repository.update_password("user@example.com", "newpassword123")

            mock_print.assert_called_once_with("Not connected to the database.")


def test_create_user_connection_failure(user_repository):

    with patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection",
        return_value=None,
    ):

        with patch("builtins.print") as mock_print:
            user_repository.create_user(
                "John", "Doe", "john.doe@example.com", "password123"
            )

            mock_print.assert_called_once_with("Not connected to the database.")
