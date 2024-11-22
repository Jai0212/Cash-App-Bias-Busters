from app.repositories.user_repository import UserRepository

class ChangePasswordInteractor:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def execute(self, email, old_password, new_password):
        user = self.user_repo.get_user_by_email_and_password(email, old_password)
        if not user:
            raise ValueError("Old password is incorrect or user does not exist")
        self.user_repo.update_password(email, new_password)
        return {"message": "Password updated successfully"}
