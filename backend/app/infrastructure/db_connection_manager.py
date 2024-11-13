# app/infrastructure/db_connection_manager.py
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class DbConnectionManager:
    @staticmethod
    def get_connection():
        """Establish and return a connection to the MySQL database."""
        try:
            DB_CONFIG = {
                "host": os.getenv("DB_HOST"),
                "port": os.getenv("DB_PORT"),
                "user": os.getenv("DB_USER"),
                "password": os.getenv("DB_PASSWORD"),
                "database": os.getenv("DB_DATABASE"),
                "ssl_disabled": False,  # Change to True if you want to disable SSL
            }
            connection = mysql.connector.connect(**DB_CONFIG)
            if connection.is_connected():
                return connection
        except Error as e:
            print(f"Error connecting to the database: {e}")
        return None
