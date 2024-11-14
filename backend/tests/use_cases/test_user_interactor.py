import pytest
from unittest.mock import MagicMock
from app.repositories.user_repository import UserRepository
from app.use_cases.user_interactor import (
    register_user_interactor,
    login_user_interactor,
    change_password_interactor
)

@pytest.fixture
def mock_user_repo():
    # Create a MagicMock instance of the UserRepository
    mock_repo = MagicMock(spec=UserRepository)
    mock_repo.table_name = 'users'
    return mock_repo

def test_register_user_interactor_email_exists(mock_user_repo):
    # Arrange
    mock_user_repo.get_user_by_email.return_value = {"email": "john.doe23@example.com"}  # Simulate existing user

    # Act & Assert
    with pytest.raises(ValueError, match="Email already exists"):
        register_user_interactor("John", "Doe", "john.doe23@example.com", "password123")

def test_login_user_interactor_success(mock_user_repo):
    # Arrange
    mock_user_repo.get_user_by_email_and_password.return_value = {"email": "john.doe23@example.com"}  # Simulate valid user

    # Act
    result = login_user_interactor("john.doe23@example.com", "newpassword")

    # Assert
    assert result == {"message": "Login successful"}

def test_login_user_interactor_invalid_credentials(mock_user_repo):
    mock_user_repo.get_user_by_email_and_password.return_value = None  # Simulate invalid credentials

    with pytest.raises(ValueError, match="Invalid credentials"):
        login_user_interactor("john.doe23@example.com", "wrongpassword")


def test_change_password_interactor_invalid_old_password(mock_user_repo):
    # Arrange
    mock_user_repo.get_user_by_email_and_password.return_value = None  # Simulate invalid old password

    # Act & Assert
    with pytest.raises(ValueError, match="Old password is incorrect or user does not exist"):
        change_password_interactor("john.doe23@example.com", "wrongoldpassword", "newpassword")