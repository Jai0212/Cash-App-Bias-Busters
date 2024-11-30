from backend.app.repositories.user_repo import UserRepo


class LoginUserInteractor:
    def __init__(self, user_repo: UserRepo):
        self.user_repo = user_repo

    def execute(self, email, password):
        user = self.user_repo.get_user_by_email_and_password(email, password)
        if not user:
            raise ValueError("Invalid credentials")
        return {"message": "Login successful"}
