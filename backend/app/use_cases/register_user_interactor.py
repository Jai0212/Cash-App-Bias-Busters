from backend.app.repositories.user_repo import UserRepo


class RegisterUserInteractor:
    def __init__(self, user_repo: UserRepo):
        self.user_repo = user_repo

    def execute(self, firstname, lastname, email, password):
        existing_user = self.user_repo.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already exists")
        self.user_repo.create_user(firstname, lastname, email, password)
        return {"message": "User registered successfully"}
