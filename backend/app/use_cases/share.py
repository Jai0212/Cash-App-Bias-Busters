from app.repositories.user_repository import UserRepository

class Share:
    def __init__(self, user_repo: UserRepository, encoded_data: str):
        self.encoded_data = encoded_data
        self.user_repo = user_repo

    def execute(self) -> dict:
        """
        Decode the data and return to fetch in share page
        """
        return self.user_repo.process_shared_data(self.encoded_data)
        
