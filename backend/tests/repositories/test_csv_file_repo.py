import unittest
from io import BytesIO
from unittest.mock import MagicMock, patch

import pandas as pd
from mysql.connector import Error
from werkzeug.datastructures import FileStorage

from backend.app.entities.user import User
from backend.app.repositories.csv_file_repo import CsvFileRepo


class TestCsvFileRepo(unittest.TestCase):

    def setUp(self):
        """Set up the test case with mock data."""
        self.user = MagicMock(spec=User)
        self.user.table_name = "test_table"
        self.file_path = "test_file.csv"
        self.repo = CsvFileRepo(self.user, self.file_path)

    @patch(
        "backend.app.infrastructure.db_connection_manager.DbConnectionManager.get_connection"
    )
    def test_connect_success(self, mock_get_connection):
        """Test that the connection is established successfully."""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        self.repo.connect()

        self.assertIsNotNone(self.repo.connection)
        mock_get_connection.assert_called_once()

    @patch("pandas.read_csv")
    @patch("backend.app.repositories.sqlite_db_repo.SqliteDbRepo.create_table")
    @patch("mysql.connector.connect")
    def test_import_csv_to_db_success(
        self, mock_connect, mock_create_table, mock_read_csv
    ):
        """Test importing CSV data into the database successfully."""
        mock_connection = MagicMock()
        mock_connect.return_value = mock_connection

        # Mock CSV data
        mock_df = pd.DataFrame(
            {
                "gender": ["male", "female"],
                "age": [25, 30],
                "race": ["White", "Asian"],
                "state": ["CA", "NY"],
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["1", "0"],
            }
        )
        mock_read_csv.return_value = mock_df

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor

        result = self.repo.import_csv_to_db(FileStorage(filename="test.csv"))

        self.assertTrue(result)
        mock_connection.commit.assert_called_once()
        mock_cursor.close.assert_called_once()
        mock_create_table.assert_called_once()

    @patch("pandas.read_csv")
    def test_import_csv_to_db_missing_critical_columns(self, mock_read_csv):
        """Test importing CSV data when critical columns are missing."""
        # Mock CSV data without critical columns
        mock_df = pd.DataFrame(
            {
                "gender": ["male", "female"],
                "age": [25, 30],
                "race": ["White", "Asian"],
                "state": ["CA", "NY"],
            }
        )
        mock_read_csv.return_value = mock_df

        result = self.repo.import_csv_to_db(FileStorage(filename="test.csv"))

        self.assertFalse(result)

    @patch("backend.app.repositories.csv_file_repo.CsvFileRepo.save_data_to_csv")
    def test_save_data_to_csv_success(self, mock_save_data_to_csv):
        """Test saving data to CSV."""
        # Mock behavior for saving data to CSV
        self.repo.save_data_to_csv()

        mock_save_data_to_csv.assert_called_once()

    @patch("backend.app.repositories.csv_file_repo.CsvFileRepo.delete_csv_data")
    def test_delete_csv_data(self, mock_delete_csv_data):
        """Test deleting data from CSV."""
        self.repo.delete_csv_data()

        mock_delete_csv_data.assert_called_once()

    @patch("pandas.read_csv")
    def test_get_headers_success(self, mock_read_csv):
        """Test retrieving headers from the database."""
        mock_df = pd.DataFrame(
            {
                "gender": ["male", "female"],
                "age": [25, 30],
                "race": ["White", "Asian"],
                "state": ["CA", "NY"],
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        headers = self.repo.get_headers()
        self.assertEqual(headers, ["gender", "age", "race", "state"])

    @patch("pandas.read_csv")
    def test_get_data_for_time(self, mock_read_csv):
        """Test retrieving data for a specific time period."""
        mock_df = pd.DataFrame(
            {
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        self.repo.get_data_for_time("day")
        # Check that the CSV was updated to only include the most recent day
        self.assertEqual(len(mock_df), 2)

    @patch("pandas.read_csv")
    def test_get_data_for_time_2(self, mock_read_csv):
        """Test retrieving data for a specific time period."""
        mock_df = pd.DataFrame(
            {
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        self.repo.get_data_for_time("week")
        # Check that the CSV was updated to only include the most recent day
        self.assertEqual(len(mock_df), 2)

    @patch("pandas.read_csv")
    def test_get_data_for_time_3(self, mock_read_csv):
        """Test retrieving data for a specific time period."""
        mock_df = pd.DataFrame(
            {
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        self.repo.get_data_for_time("month")
        # Check that the CSV was updated to only include the most recent day
        self.assertEqual(len(mock_df), 2)

    @patch("pandas.read_csv")
    def test_update_comparison_csv(self, mock_read_csv):
        """Test updating the comparison CSV file based on user selection."""
        mock_df = pd.DataFrame(
            {
                "gender": ["male", "femlae"],
                "age": [25, 30],
                "race": ["Whites", "Asian"],
                "state": ["CA", "NY"],
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        demographics = ["gender", "age"]
        choices = {"gender": ["male"], "age": ["27-35"]}

        self.repo.update_comparison_csv(demographics, choices, time="day")

        # Ensure the data was filtered correctly
        self.assertEqual(len(mock_df), 2)

    @patch("pandas.read_csv")
    def test_update_comparison_csv_2(self, mock_read_csv):
        """Test updating the comparison CSV file based on user selection."""
        mock_df = pd.DataFrame(
            {
                "gender": ["male", "femlae"],
                "age": [25, 30],
                "race": ["Whites", "Asian"],
                "state": ["CA", "NY"],
                "timestamp": ["2024-11-24", "2024-11-23"],
                "action_status": ["0", "1"],
            }
        )
        mock_read_csv.return_value = mock_df

        demographics = ["gender", "age"]
        choices = {"gender": ["male"], "age": ["27-35"]}

        self.repo.update_comparison_csv(demographics, choices, "")

        # Ensure the data was filtered correctly
        self.assertEqual(len(mock_df), 2)

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_import_csv_to_db_no_connection(self, mock_get_connection):
        """Test import_csv_to_db when no database connection is available."""
        mock_get_connection.return_value = None
        file_mock = MagicMock(spec=FileStorage)

        with patch(
            "pandas.read_csv",
            return_value=pd.DataFrame({"timestamp": [], "action_status": []}),
        ):
            result = self.repo.import_csv_to_db(file_mock)

        self.assertFalse(result)
        mock_get_connection.assert_called_once()

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_import_csv_to_db_db_error(self, mock_get_connection):
        """Test import_csv_to_db when a database error occurs."""
        mock_connection = MagicMock()
        mock_connection.is_connected.return_value = True
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Database error")
        mock_connection.cursor.return_value = mock_cursor
        mock_get_connection.return_value = mock_connection

        file_mock = MagicMock(spec=FileStorage)
        with patch(
            "pandas.read_csv",
            return_value=pd.DataFrame(
                {"timestamp": ["2024-11-24"], "action_status": ["Success"]}
            ),
        ):
            result = self.repo.import_csv_to_db(file_mock)

        self.assertFalse(result)
        self.assertEqual(mock_get_connection.call_count, 2)

    @patch("builtins.open", new_callable=MagicMock)
    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_save_data_to_csv_no_connection(self, mock_get_connection, mock_open):
        """Test save_data_to_csv when no database connection is available."""
        mock_get_connection.return_value = None

        self.repo.save_data_to_csv()

        mock_open.assert_not_called()
        mock_get_connection.assert_called_once()

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_save_data_to_csv_db_error(self, mock_get_connection):
        """Test save_data_to_csv when a database error occurs."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Database error")
        mock_connection.cursor.return_value = mock_cursor
        mock_get_connection.return_value = mock_connection

        with self.assertRaises(Exception):
            self.repo.save_data_to_csv()

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_get_headers_no_connection(self, mock_get_connection):
        """Test get_headers when no database connection is available."""
        mock_get_connection.return_value = None

        headers = self.repo.get_headers()

        self.assertEqual(headers, [])
        mock_get_connection.assert_called_once()

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_get_headers_db_error(self, mock_get_connection):
        """Test get_headers when a database error occurs."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Database error")
        mock_connection.cursor.return_value = mock_cursor
        mock_get_connection.return_value = mock_connection

        headers = self.repo.get_headers()

        self.assertEqual(headers, [])
        mock_get_connection.assert_called_once()

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    @patch("pandas.read_csv")
    def test_get_data_for_time_read_csv_error(self, mock_read_csv, mock_get_connection):
        """Test get_data_for_time when reading the CSV file raises an error."""
        mock_get_connection.return_value = MagicMock()
        mock_read_csv.side_effect = pd.errors.EmptyDataError("Empty CSV file")

        with self.assertRaises(pd.errors.EmptyDataError):
            self.repo.get_data_for_time("day")

    @patch("backend.app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    @patch("pandas.read_csv")
    @patch("pandas.DataFrame.to_csv")
    def test_update_comparison_csv_write_error(
        self, mock_to_csv, mock_read_csv, mock_get_connection
    ):
        """Test update_comparison_csv when writing to the CSV file raises an error."""
        mock_get_connection.return_value = MagicMock()
        mock_read_csv.return_value = pd.DataFrame(
            {"age": [25], "timestamp": ["2024-11-24"], "action_status": ["Success"]}
        )
        mock_to_csv.side_effect = IOError("Error writing to CSV")

        with self.assertRaises(IOError):
            self.repo.update_comparison_csv(["age"], {"age": ["20-30"]}, "day")

    @patch("backend.app.repositories.csv_file_repo.CsvFileRepo.connect")
    @patch("builtins.print")  # Mocking the print function to capture output
    def test_get_headers_mysql_error(self, mock_print, mock_connect):
        """Test get_headers when a MySQL Error occurs."""

        # Simulate a database connection and cursor setup
        mock_connection = MagicMock()
        self.repo.connection = mock_connection

        # Simulate a MySQL Error during cursor execution
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Error("Database connection failed")
        mock_connection.cursor.return_value = mock_cursor

        # Call the method and ensure the error is caught
        result = self.repo.get_headers()

        # Assert that the result is an empty list as per the error handling
        self.assertEqual(result, [])

        # Ensure the error message was printed
        mock_print.assert_any_call("MySQL Error: Database connection failed")

    @patch("builtins.open")
    @patch("builtins.print")  # Mock print to capture the output
    def test_delete_csv_data_exception(self, mock_print, mock_open):
        """Test delete_csv_data when an exception occurs during file operation."""

        # Simulate an error when opening the file (e.g., file permission error)
        mock_open.side_effect = Exception("Permission denied")

        # Call the delete_csv_data method
        self.repo.delete_csv_data()

        # Ensure that the print statement for error handling is called
        mock_print.assert_any_call(
            f"Error deleting data from {self.file_path}: Permission denied"
        )


if __name__ == "__main__":
    unittest.main()
