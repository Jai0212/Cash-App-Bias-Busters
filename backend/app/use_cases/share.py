from backend.app.repositories.user_repo import UserRepo


class Share:
    """A class to handle sharing functionality.
    Attributes:
    -----------
    user_repo : UserRepository
        An instance of UserRepository to handle user-related operations.
    encoded_data : str
        The encoded data to be processed.
    Methods:
    --------
    __init__(self, user_repo: UserRepository, encoded_data: str)
        Initializes the Share class with user repository and encoded data.
    execute(self) -> dict
        Decodes the data and returns the processed result for the share page."""

    def __init__(self, user_repo: UserRepo, encoded_data: str):
        self.encoded_data = encoded_data
        self.user_repo = user_repo

    def execute(self) -> dict:
        """
        Decode the data and return to fetch in share page
        """
        return self.user_repo.process_shared_data(self.encoded_data)
