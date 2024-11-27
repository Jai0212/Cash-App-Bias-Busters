from abc import ABC, abstractmethod
from typing import Optional
from werkzeug.datastructures import FileStorage


class DatabaseRepositoryInterface(ABC):
    """
    Abstract base class for database repository operations.

    Methods
    -------
    see_all_tables() -> None
        Abstract method to see all tables in the database.

    create_table() -> None
        Abstract method to create a new table in the database.

    delete_table() -> None
        Abstract method to delete a table from the database.

    fetch_data(p: bool = False) -> tuple[list[str], tuple[str, ...]]
        Abstract method to fetch data from the database.
        Parameters:
            p (bool): Optional parameter to specify a condition for fetching data.
        Returns:
            tuple: A tuple containing a list of strings and a tuple of strings.

    update_db_for_user(demographics: list[str], choices: dict[str, list[str]], time: str) -> None
        Abstract method to update the database for a user.
        Parameters:
            demographics (list[str]): List of demographic information.
            choices (dict[str, list[str]]): Dictionary of user choices.
            time (str): Timestamp of the update.

    get_last_login_data() -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]
        Abstract method to get the last login data.
        Returns:
            tuple: A tuple containing optional list of strings, optional dictionary of user choices, and optional timestamp.
    """

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


class FileRepositoryInterface(ABC):
    """
    FileRepository is an abstract base class that defines the interface for file repository operations.

    Methods:
        import_csv_to_db(csv_file: FileStorage) -> bool:
            Abstract method to import data from a CSV file into the database.

        save_data_to_csv() -> None:
            Abstract method to save data from the database to a CSV file.

        delete_csv_data() -> None:
            Abstract method to delete data from the CSV file.

        get_headers() -> list[str]:
            Abstract method to retrieve the headers from the CSV file.

        update_comparison_csv(demographics: list[str], choices: dict[str, list[str]], time: str) -> None:
            Abstract method to update the comparison CSV file with the given demographics, choices, and time.

        get_data_for_time(time: str) -> None:
            Abstract method to retrieve data for a specific time.
    """

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
