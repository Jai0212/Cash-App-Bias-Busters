import unittest
from unittest.mock import MagicMock

from backend.app.repositories.user_repo import UserRepo
from backend.app.use_cases.register_user_interactor import RegisterUserInteractor


class TestRegisterUserInteractor(unittest.TestCase):

    def setUp(self):
        # Create a mock of UserRepository
        self.mock_user_repo = MagicMock(spec=UserRepo)
        # Create an instance of RegisterUserInteractor with the mocked repository
        self.register_user_interactor = RegisterUserInteractor(self.mock_user_repo)

    def test_execute_successful_user_registration(self):
        # Arrange
        firstname = "John"
        lastname = "Doe"
        email = "user@example.com"
        password = "secure_password"

        # Mock the behavior of get_user_by_email to return None (email doesn't exist)
        self.mock_user_repo.get_user_by_email.return_value = None

        # Act
        result = self.register_user_interactor.execute(
            firstname, lastname, email, password
        )

        # Assert
        self.mock_user_repo.create_user.assert_called_once_with(
            firstname, lastname, email, password
        )  # Check if create_user was called with the correct parameters
        self.assertEqual(
            result, {"message": "User registered successfully"}
        )  # Verify the return message

    def test_execute_email_already_exists(self):
        # Arrange
        firstname = "John"
        lastname = "Doe"
        email = "user@example.com"
        password = "secure_password"

        # Mock the behavior of get_user_by_email to simulate that the email already exists
        self.mock_user_repo.get_user_by_email.return_value = {"email": email}

        # Act and Assert
        with self.assertRaises(ValueError) as context:
            self.register_user_interactor.execute(firstname, lastname, email, password)

        self.assertEqual(str(context.exception), "Email already exists")
        self.mock_user_repo.create_user.assert_not_called()  # Ensure create_user is not called if email already exists


if __name__ == "__main__":
    unittest.main()
