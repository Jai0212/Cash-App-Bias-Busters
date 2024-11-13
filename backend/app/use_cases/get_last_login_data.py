# /app/use_cases/get_table_headers.py

from app.repositories.interfaces import DatabaseRepository
from typing import Optional


class GetLastLoginData:
    def __init__(self, db_repo: DatabaseRepository):
        self.db_repo = db_repo

    def execute(self) -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]:
        return self.db_repo.get_last_login_data()
