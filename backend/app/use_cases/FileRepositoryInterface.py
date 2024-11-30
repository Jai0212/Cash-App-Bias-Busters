from abc import ABC, abstractmethod

from werkzeug.datastructures import FileStorage


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
