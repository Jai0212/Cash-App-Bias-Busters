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
    def fetch_data(self, p: bool = False) -> tuple[list[str], tuple[str, ...]]:
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


class UserRepositoryInterface(ABC):
    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Fetches a user by their email."""
        pass

    @abstractmethod
    def create_user(
        self, firstname: str, lastname: str, email: str, password: str
    ) -> None:
        """Inserts a new user into the users table."""
        pass

    @abstractmethod
    def get_user_by_email_and_password(
        self, email: str, password: str
    ) -> Optional[dict]:
        """Fetches a user by their email and password."""
        pass

    @abstractmethod
    def update_password(self, email: str, new_password: str) -> None:
        """Updates the password of a user by their email."""
        pass

    @abstractmethod
    def process_shared_data(self, encoded_data: str) -> dict:
        """
        Decodes and processes the shared data.

        Args:
            encoded_data (str): Base64 encoded JSON string.

        Returns:
            dict: Decoded and parsed data.

        Raises:
            ValueError: If decoding or JSON parsing fails.
        """
        pass
