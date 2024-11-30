# app/infrastructure/db_connection_manager.py
import os

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error

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
                "ssl_disabled": True,  # Change to True if you want to disable SSL
            }
            connection = mysql.connector.connect(**DB_CONFIG)
            if connection.is_connected():
                return connection
        except Error as e:
            print(f"Error connecting to the database: {e}")
        return None
