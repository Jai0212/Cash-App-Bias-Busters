from abc import ABC, abstractmethod
from typing import Optional


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
