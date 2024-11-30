import unittest
from unittest.mock import MagicMock

from backend.app.repositories.user_repo import UserRepo
from backend.app.use_cases.change_password_interactor import ChangePasswordInteractor


class TestChangePasswordInteractor(unittest.TestCase):

    def setUp(self):
        # Create a mock of UserRepository
        self.mock_user_repo = MagicMock(spec=UserRepo)
        # Create an instance of ChangePasswordInteractor with the mocked repository
        self.change_password_interactor = ChangePasswordInteractor(self.mock_user_repo)

    def test_execute_successful_password_change(self):
        # Arrange
        email = "user@example.com"
        old_password = "old_password"
        new_password = "new_password"

        # Mock the behavior of get_user_by_email_and_password to return a user
        self.mock_user_repo.get_user_by_email_and_password.return_value = {
            "email": email
        }

        # Act
        result = self.change_password_interactor.execute(
            email, old_password, new_password
        )

        # Assert
        self.mock_user_repo.update_password.assert_called_once_with(
            email, new_password
        )  # Check if update_password was called with the correct parameters
        self.assertEqual(
            result, {"message": "Password updated successfully"}
        )  # Verify the return message

    def test_execute_user_not_found_or_incorrect_password(self):
        # Arrange
        email = "user@example.com"
        old_password = "wrong_old_password"
        new_password = "new_password"

        # Mock the behavior of get_user_by_email_and_password to return None (user not found)
        self.mock_user_repo.get_user_by_email_and_password.return_value = None

        # Act and Assert
        with self.assertRaises(ValueError) as context:
            self.change_password_interactor.execute(email, old_password, new_password)

        self.assertEqual(
            str(context.exception), "Old password is incorrect or user does not exist"
        )
        self.mock_user_repo.update_password.assert_not_called()  # Ensure update_password is not called


if __name__ == "__main__":
    unittest.main()
