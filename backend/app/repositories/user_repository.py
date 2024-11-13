from app.infrastructure.db_connection_manager import DbConnectionManager
from mysql.connector import Error
from typing import Optional
import pymysql.cursors


class UserRepository:
    def __init__(self):
        self.connection = None

    def connect(self):
        """Establishes the database connection using DbConnectionManager."""
        self.connection = DbConnectionManager.get_connection()

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Fetches a user by their email."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return None

            with self.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()

            return user

        except Error as e:
            print(f"Error: {e}")
            return None

    def create_user(self, firstname: str, lastname: str, email: str, password: str) -> None:
        """Inserts a new user into the users table."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return

            with self.connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (firstname, lastname, email, password)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (firstname, lastname, email, password)
                )
                self.connection.commit()
                print("User created successfully.")

        except Error as e:
            print(f"Error: {e}")

    def get_user_by_email_and_password(self, email: str, password: str) -> Optional[dict]:
        """Fetches a user by their email and password."""
        self.connect()

        try:
            if not self.connection:
                print("Not connected to the database.")
                return None

            with self.connection.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
                user = cursor.fetchone()

            return user

        except Error as e:
            print(f"Error: {e}")
            return None
