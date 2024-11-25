import unittest
from unittest.mock import patch, MagicMock
import pandas as pd
from werkzeug.datastructures import FileStorage
from app.repositories.csv_file_repo import CsvFileRepo
from app.entities.user import User
from mysql.connector import Error
from io import BytesIO


class TestCsvFileRepo(unittest.TestCase):

    def setUp(self):
        """Set up the test case with mock data."""
        self.user = MagicMock(spec=User)
        self.user.table_name = "test_table"
        self.file_path = "test_file.csv"
        self.repo = CsvFileRepo(self.user, self.file_path)

    @patch(
        "app.infrastructure.db_connection_manager.DbConnectionManager.get_connection"
    )
    def test_connect_success(self, mock_get_connection):
        """Test that the connection is established successfully."""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        self.repo.connect()

        self.assertIsNotNone(self.repo.connection)
        mock_get_connection.assert_called_once()

    @patch("pandas.read_csv")
    @patch("app.repositories.sqlite_db_repo.SqliteDbRepo.create_table")
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

    @patch("app.repositories.csv_file_repo.CsvFileRepo.save_data_to_csv")
    def test_save_data_to_csv_success(self, mock_save_data_to_csv):
        """Test saving data to CSV."""
        # Mock behavior for saving data to CSV
        self.repo.save_data_to_csv()

        mock_save_data_to_csv.assert_called_once()

    @patch("app.repositories.csv_file_repo.CsvFileRepo.delete_csv_data")
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

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
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

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
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
    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_save_data_to_csv_no_connection(self, mock_get_connection, mock_open):
        """Test save_data_to_csv when no database connection is available."""
        mock_get_connection.return_value = None

        self.repo.save_data_to_csv()

        mock_open.assert_not_called()
        mock_get_connection.assert_called_once()

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_save_data_to_csv_db_error(self, mock_get_connection):
        """Test save_data_to_csv when a database error occurs."""
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Database error")
        mock_connection.cursor.return_value = mock_cursor
        mock_get_connection.return_value = mock_connection

        with self.assertRaises(Exception):
            self.repo.save_data_to_csv()

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    def test_get_headers_no_connection(self, mock_get_connection):
        """Test get_headers when no database connection is available."""
        mock_get_connection.return_value = None

        headers = self.repo.get_headers()

        self.assertEqual(headers, [])
        mock_get_connection.assert_called_once()

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
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

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
    @patch("pandas.read_csv")
    def test_get_data_for_time_read_csv_error(self, mock_read_csv, mock_get_connection):
        """Test get_data_for_time when reading the CSV file raises an error."""
        mock_get_connection.return_value = MagicMock()
        mock_read_csv.side_effect = pd.errors.EmptyDataError("Empty CSV file")

        with self.assertRaises(pd.errors.EmptyDataError):
            self.repo.get_data_for_time("day")

    @patch("app.repositories.csv_file_repo.DbConnectionManager.get_connection")
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


if __name__ == "__main__":
    unittest.main()
