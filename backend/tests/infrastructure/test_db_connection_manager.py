from unittest.mock import MagicMock, patch

import pytest
from mysql.connector import Error

from backend.app.infrastructure.db_connection_manager import DbConnectionManager


@pytest.fixture(autouse=True)
def set_env_variables(monkeypatch):
    # Set environment variables for the test
    monkeypatch.setenv("DB_HOST", "localhost")
    monkeypatch.setenv("DB_PORT", "3306")
    monkeypatch.setenv("DB_USER", "test_user")
    monkeypatch.setenv("DB_PASSWORD", "test_password")
    monkeypatch.setenv("DB_DATABASE", "test_database")


@patch("mysql.connector.connect")
def test_get_connection_success(mock_connect):
    # Arrange
    mock_connection = MagicMock()
    mock_connection.is_connected.return_value = True
    mock_connect.return_value = mock_connection

    # Act
    connection = DbConnectionManager.get_connection()

    # Assert
    assert connection is not None
    mock_connect.assert_called_once_with(
        host="localhost",
        port="3306",
        user="test_user",
        password="test_password",
        database="test_database",
        ssl_disabled=True,
    )
    assert connection.is_connected()


@patch("mysql.connector.connect")
def test_get_connection_failure(mock_connect):
    # Arrange: Simulate connection failure
    mock_connect.side_effect = Error("Connection failed")

    # Act
    connection = DbConnectionManager.get_connection()

    # Assert
    assert connection is None
    mock_connect.assert_called_once_with(
        host="localhost",
        port="3306",
        user="test_user",
        password="test_password",
        database="test_database",
        ssl_disabled=True,
    )


@patch("mysql.connector.connect")
def test_get_connection_not_connected(mock_connect):
    # Arrange: Simulate a case where connection does not reach `is_connected`
    mock_connection = MagicMock()
    mock_connection.is_connected.return_value = False
    mock_connect.return_value = mock_connection

    # Act
    connection = DbConnectionManager.get_connection()

    # Assert
    assert connection is None
    mock_connect.assert_called_once_with(
        host="localhost",
        port="3306",
        user="test_user",
        password="test_password",
        database="test_database",
        ssl_disabled=True,
    )
