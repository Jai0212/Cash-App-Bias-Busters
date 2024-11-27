from app.repositories.interfaces import FileRepositoryInterface


class GetHeaders:
    """GetHeaders is a use case class responsible for fetching and returning the headers (column names) of a database table,
    excluding critical columns such as 'timestamp' and 'action_status'.

    Attributes:
        file_repo (FileRepositoryInterface): An interface for the file repository to interact with the data source.

    Methods:
        __init__(file_repo: FileRepositoryInterface):
            Initializes the GetHeaders use case with the provided file repository interface.

        execute() -> list[str]:
            Fetches and returns the headers of the database table, excluding critical columns.
            Returns an empty list if no headers are found or if an error occurs."""

    def __init__(self, file_repo: FileRepositoryInterface):
        self.file_repo = file_repo

    def execute(self) -> list[str]:
        """
        Fetch and return the headers (column names) of the database table
        without the critical columns (e.g., timestamp and action_status).
        """
        try:
            headers = self.file_repo.get_headers()
            if not headers:
                print("No headers found or less than 2 demographics in the dataset.")
                return []
            return headers
        except Exception as e:
            print(f"An error occurred in GetHeaders use case: {e}")
            return []
