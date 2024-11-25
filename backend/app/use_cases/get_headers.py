from app.repositories.interfaces import FileRepository


class GetHeaders:
    def __init__(self, file_repo: FileRepository):
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
