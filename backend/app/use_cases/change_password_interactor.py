from backend.app.repositories.user_repo import UserRepo


class ChangePasswordInteractor:
    """
    This interactor handles the logic for changing a user's password.
    """
    def __init__(self, user_repo: UserRepo):
        """
        Initializes the ChangePasswordInteractor with a user repository.

        :param user_repo: Instance of UserRepository for user data operations.
        """
        self.user_repo = user_repo

    def execute(self, email: str, old_password: str, new_password: str) -> dict:
        """
        Changes the user's password by verifying the old password and updating it to the new one.

        :param email: The email address of the user.
        :param old_password: The current password of the user.
        :param new_password: The new password to set for the user.
        :return: A dictionary containing a success message.
        :raises ValueError: If the old password is incorrect or the user does not exist.
        """
        user = self.user_repo.get_user_by_email_and_password(email, old_password)
        if not user:
            raise ValueError("Old password is incorrect or user does not exist")
        self.user_repo.update_password(email, new_password)
        return {"message": "Password updated successfully"}
