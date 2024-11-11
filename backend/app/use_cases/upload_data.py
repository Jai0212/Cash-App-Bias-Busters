from app.repositories.interfaces import FileRepository
from werkzeug.datastructures import FileStorage


class UploadData:
    def __init__(self, file_repo: FileRepository):
        self.file_repo = file_repo

    def execute(self, csv_file: FileStorage) -> bool:
        return self.file_repo.import_csv_to_db(csv_file)
