# /app/use_cases/get_table_headers.py

from app.repositories.interfaces import DatabaseRepositoryInterface
from typing import Optional


class GetLastLoginData:
    """
    A use case class to get the last login data from the database repository.

    Attributes:
        db_repo (DatabaseRepositoryInterface): An instance of the database repository interface.

    Methods:
        execute() -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]:
            Retrieves the last login data from the database repository.
            Returns a tuple containing:
                - A list of strings representing the last login data (or None if not available).
                - A dictionary with string keys and list of strings as values representing additional login data (or None if not available).
                - A string representing any error message (or None if no error).
    """
    def __init__(self, db_repo: DatabaseRepositoryInterface):
        self.db_repo = db_repo

    def execute(self) -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]:
        return self.db_repo.get_last_login_data()
