from werkzeug.datastructures import FileStorage

from backend.app.use_cases.FileRepositoryInterface import FileRepositoryInterface


class UploadData:
    """
    A use case class responsible for handling the upload of CSV data.

    Attributes:
        file_repo (FileRepositoryInterface): An interface for file repository operations.

    Methods:
        __init__(file_repo: FileRepositoryInterface):
            Initializes the UploadData instance with a file repository interface.

        execute(csv_file: FileStorage) -> bool:
            Executes the upload process by importing the CSV file to the database.
            Args:
                csv_file (FileStorage): The CSV file to be uploaded.
            Returns:
                bool: True if the import is successful, False otherwise.
    """

    def __init__(self, file_repo: FileRepositoryInterface):
        self.file_repo = file_repo

    def execute(self, csv_file: FileStorage) -> bool:
        return self.file_repo.import_csv_to_db(csv_file)
