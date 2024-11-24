import pytest
from unittest.mock import MagicMock, patch
from app.repositories.user_repository import UserRepository
from mysql.connector import Error


@pytest.fixture
def mock_db_connection():
    # Mock the DbConnectionManager's get_connection method
    with patch('app.infrastructure.db_connection_manager.DbConnectionManager.get_connection') as mock_get_conn:
        mock_connection = MagicMock()
        mock_get_conn.return_value = mock_connection
        yield mock_connection


@pytest.fixture
def user_repository(mock_db_connection):
    # Create an instance of UserRepository with a mock connection
    return UserRepository(table_name="users")


def test_get_user_by_email_success(user_repository, mock_db_connection):
    # Mock cursor and result
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = {"email": "john.doe@example.com", "firstname": "John", "lastname": "Doe"}

    # Test the method to fetch a user by email
    result = user_repository.get_user_by_email("john.doe@example.com")

    # Assert the result is the expected user data
    assert result == {"email": "john.doe@example.com", "firstname": "John", "lastname": "Doe"}
    mock_db_connection.cursor.assert_called_once()


def test_get_user_by_email_not_found(user_repository, mock_db_connection):
    # Mock cursor and result
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = None

    # Test when user is not found
    result = user_repository.get_user_by_email("nonexistent@example.com")

    # Assert result is None (no user found)
    assert result is None


def test_get_user_by_email_and_password_success(user_repository, mock_db_connection):
    # Mock cursor and result
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = {"email": "john.doe@example.com", "firstname": "John", "lastname": "Doe"}

    # Test fetching a user by email and password
    result = user_repository.get_user_by_email_and_password("john.doe@example.com", "password123")

    # Assert the result is the expected user data
    assert result == {"email": "john.doe@example.com", "firstname": "John", "lastname": "Doe"}


def test_get_user_by_email_and_password_invalid(user_repository, mock_db_connection):
    # Mock cursor and result for invalid credentials
    mock_cursor = MagicMock()
    mock_db_connection.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = None

    # Test fetching a user with invalid credentials
    result = user_repository.get_user_by_email_and_password("john.doe@example.com", "wrongpassword")

    # Assert result is None (invalid credentials)
    assert result is None

