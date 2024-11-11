# /app/repositories/interfaces.py

from abc import ABC, abstractmethod
from typing import Optional
from werkzeug.datastructures import FileStorage


class DatabaseRepository(ABC):
    @abstractmethod
    def see_all_tables(self) -> None:
        pass

    @abstractmethod
    def create_table(self) -> None:
        pass

    @abstractmethod
    def delete_table(self) -> None:
        pass

    @abstractmethod
    def fetch_data(self) -> tuple[list[str], tuple[str, ...]]:
        pass

    @abstractmethod
    def update_db_for_user(
        self,
        demographics: list[str],
        choices: dict[str, list[str]],
        time: str,
    ) -> None:
        pass

    @abstractmethod
    def get_last_login_data(
        self,
    ) -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]:
        pass


class FileRepository(ABC):
    @abstractmethod
    def import_csv_to_db(self, csv_file: FileStorage) -> bool:
        pass

    @abstractmethod
    def save_data_to_csv(self) -> None:
        pass

    @abstractmethod
    def delete_csv_data(self) -> None:
        pass

    @abstractmethod
    def get_headers(self) -> list[str]:
        pass

    @abstractmethod
    def update_comparison_csv(
        self,
        demographics: list[str],
        choices: dict[str, list[str]],
        time: str,
    ) -> None:
        pass

    @abstractmethod
    def get_data_for_time(self, time: str) -> None:
        pass
