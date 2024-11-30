from app.repositories.user_repository import UserRepository

class LoginUserInteractor:
    """
    This interactor handles the logic for logging in a user.
    """
    def __init__(self, user_repo: UserRepository):
        """
       Initializes the LoginUserInteractor with a user repository.

       :param user_repo: Instance of UserRepository for user data operations.
       """
        self.user_repo = user_repo

    def execute(self, email, password)-> dict:
        """
        Authenticates a user by verifying their email and password.

        :param email: The email address of the user.
        :param password: The password of the user.
        :return: A dictionary containing a success message.
        :raises ValueError: If the email and password combination is invalid.
        """
        user = self.user_repo.get_user_by_email_and_password(email, password)
        if not user:
            raise ValueError("Invalid credentials")
        return {"message": "Login successful"}
