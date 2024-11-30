import base64
import json
from typing import Optional

from mysql.connector import Error

from backend.app.infrastructure.db_connection_manager import DbConnectionManager
from backend.app.use_cases.UserRepositoryInterface import UserRepositoryInterface


class UserRepo(UserRepositoryInterface):
    """UserRepo is a repository class that provides methods to interact with the users table in the database.

    Methods
    -------
    __init__(table_name: str)
        Initializes the UserRepo with the specified table name.

    connect()
        Establishes the database connection using DbConnectionManager.

    get_user_by_email(email: str) -> Optional[dict]
        Fetches a user by their email.

    create_user(firstname: str, lastname: str, email: str, password: str) -> None
        Inserts a new user into the users table.

    get_user_by_email_and_password(email: str, password: str) -> Optional[dict]
        Fetches a user by their email and password.

    update_password(email: str, new_password: str) -> None
        Updates the password of a user by their email.

    process_shared_data(encoded_data: str) -> dict"""

    def __init__(self, table_name: str):
        self.connection = None
        self.table_name = table_name

    def connect(self):
        """Establishes the database connection using DbConnectionManager."""
        self.connection = DbConnectionManager.get_connection()
        if self.connection:
            print("Connected")

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Fetches a user by their email."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return None

            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            cursor.close()
            return user

        except Error as e:
            print(f"Error: {e}")
            return None

    def create_user(
        self, firstname: str, lastname: str, email: str, password: str
    ) -> None:
        """Inserts a new user into the users table."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()
            cursor.execute(
                """
                INSERT INTO users (firstname, lastname, email, password)
                VALUES (%s, %s, %s, %s)
                """,
                (firstname, lastname, email, password),
            )
            self.connection.commit()
            print("User created successfully.")
            cursor.close()

        except Error as e:
            print(f"Error: {e}")

    def get_user_by_email_and_password(
        self, email: str, password: str
    ) -> Optional[dict]:
        """Fetches a user by their email and password."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return None

            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM users WHERE email = %s AND password = %s",
                (email, password),
            )
            user = cursor.fetchone()

            cursor.close()
            return user

        except Error as e:
            print(f"Error: {e}")
            return None

    def update_password(self, email: str, new_password: str) -> None:
        """Updates the password of a user by their email."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()
            cursor.execute(
                """
                UPDATE users
                SET password = %s
                WHERE email = %s
                """,
                (new_password, email),
            )
            self.connection.commit()
            print(f"Password for {email} updated successfully.")
            cursor.close()

        except Error as e:
            print(f"Error: {e}")

    def process_shared_data(self, encoded_data: str) -> dict:
        """
        Decodes and processes the shared data.
        """
        try:
            # Decode the Base64 encoded string
            decoded_data = base64.b64decode(encoded_data).decode("utf-8")

            # Parse the JSON string to a Python dictionary
            data = json.loads(decoded_data)

            # Return the processed data
            return data

        except (base64.binascii.Error, json.JSONDecodeError) as e:
            raise ValueError(f"Invalid encoded data: {e}")
