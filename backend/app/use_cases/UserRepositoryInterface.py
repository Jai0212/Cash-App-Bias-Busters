from abc import ABC, abstractmethod
from typing import Optional


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
