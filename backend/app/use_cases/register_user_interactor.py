from backend.app.repositories.user_repo import UserRepo


class RegisterUserInteractor:
    """
    This interactor handles the logic for registering a new user.
    """
    def __init__(self, user_repo: UserRepo):
        """
        Initializes the RegisterUserInteractor with a user repository.
        :param user_repo: Instance of UserRepository for user data operations.
        """
        self.user_repo = user_repo

    def execute(self, firstname: str, lastname: str, email: str, password: str) -> dict:
        """
        Registers a new user by checking if the email already exists and then
        creating a new user record in the repository.

        :param firstname: First name of the user.
        :param lastname: Last name of the user.
        :param email: Email address of the user.
        :param password: Password for the user.
        :return: A dictionary containing a success message.
        :raises ValueError: If the email already exists in the system.
        """
        existing_user = self.user_repo.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already exists")
        self.user_repo.create_user(firstname, lastname, email, password)
        return {"message": "User registered successfully"}
