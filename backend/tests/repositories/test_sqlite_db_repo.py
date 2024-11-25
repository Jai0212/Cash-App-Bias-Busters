import unittest
from unittest.mock import patch, MagicMock
from app.repositories.sqlite_db_repo import SqliteDbRepo
from app.entities.user import User
from mysql.connector import Error


class TestSqliteDbRepo(unittest.TestCase):
    def setUp(self):
        # Setup a mock user
        self.user = User("ff@gmail.com")
        self.repo = SqliteDbRepo(self.user)

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_connect(self, mock_get_connection):
        # Test the connection method
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        self.repo.connect()
        mock_get_connection.assert_called_once()
        self.assertEqual(self.repo.connection, mock_connection)

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_see_all_tables(self, mock_get_connection):
        # Test seeing all tables in the database
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.fetchall.return_value = [("users",), ("posts",)]

        self.repo.see_all_tables()
        mock_cursor.execute.assert_called_once_with("SHOW TABLES")
        mock_cursor.fetchall.assert_called_once()
        mock_cursor.close.assert_called_once()

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_create_table(self, mock_get_connection):
        # Test table creation
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor

        self.repo.create_table()
        mock_cursor.execute.assert_called_once()
        mock_cursor.close.assert_called_once()

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_delete_table(self, mock_get_connection):
        # Test table deletion
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor

        self.repo.delete_table()
        mock_cursor.execute.assert_called_once_with(
            f"DROP TABLE IF EXISTS `ff@gmail.com`"
        )
        mock_cursor.close.assert_called_once()

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_fetch_data(self, mock_get_connection):
        # Test data fetching
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.fetchall.return_value = [("data1", "data2"), ("data3", "data4")]
        mock_cursor.description = [("column1",), ("column2",)]

        headers, results = self.repo.fetch_data(p=True)
        self.assertEqual(headers, ["column1", "column2"])
        self.assertEqual(results, [("data1", "data2"), ("data3", "data4")])

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_update_db_for_user(self, mock_get_connection):
        # Test updating user data in the database
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor

        demographics = ["gender", "age"]
        choices = {
            "gender": ["male", "female", "non-binary", "other"],
            "age": ["18-26", "27-35", "35-43", "44-52"],
        }
        time = "year"
        email = "ff@gmail.com"  # Ensure this matches your actual test data

        # Call the method
        self.repo.update_db_for_user(demographics, choices, time)

        # Check if the correct query is executed
        mock_cursor.execute.assert_called_once_with(
            """
            UPDATE users
            SET demographic_1 = %s, choice_1_demographic_1 = %s, choice_2_demographic_1 = %s, choice_3_demographic_1 = %s, choice_4_demographic_1 = %s, demographic_2 = %s, choice_1_demographic_2 = %s, choice_2_demographic_2 = %s, choice_3_demographic_2 = %s, choice_4_demographic_2 = %s, time = %s
            WHERE email = %s
            """,
            (
                "gender",  # demographic_1
                "male",  # choice_1_demographic_1
                "female",  # choice_2_demographic_1
                "non-binary",  # choice_3_demographic_1
                "other",  # choice_4_demographic_1
                "age",  # demographic_2
                "18-26",  # choice_1_demographic_2
                "27-35",  # choice_2_demographic_2
                "35-43",  # choice_3_demographic_2
                "44-52",  # choice_4_demographic_2
                "year",  # time
                "ff@gmail.com",  # email
            ),
        )
        mock_cursor.close.assert_called_once()

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_get_last_login_data(self, mock_get_connection):
        # Test getting last login data
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = (
            "gender",
            "male",
            "female",
            "non-binary",
            "other",
            "age",
            "18-26",
            "27-35",
            "36-44",
            "45-53",
            "year",
        )

        demographics, choices, time = self.repo.get_last_login_data()

        # Assert demographics are correct
        self.assertEqual(set(demographics), set(["age", "gender"]))

        # Assert choices are correctly mapped
        self.assertEqual(
            choices,
            {
                "gender": ["male", "female", "non-binary", "other"],
                "age": ["18-26", "27-35", "36-44", "45-53"],
            },
        )
        self.assertEqual(time, "year")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_get_last_login_data_no_data(self, mock_get_connection):
        # Test when no data is found for last login
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection

        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = None

        demographics, choices, time = self.repo.get_last_login_data()

        self.assertIsNone(demographics)
        self.assertIsNone(choices)
        self.assertIsNone(time)

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_create_table_connection_error(self, mock_get_connection):
        """Test create table with connection error"""
        mock_get_connection.return_value = None  # Simulate no connection

        with patch("builtins.print") as mock_print:
            self.repo.create_table()
            mock_print.assert_called_with("Not connected to the database.")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_create_table_sql_error(self, mock_get_connection):
        """Test SQL error when creating table"""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        mock_connection.cursor.side_effect = Error("SQL error")

        with patch("builtins.print") as mock_print:
            self.repo.create_table()
            mock_print.assert_called_with("Error: SQL error")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_delete_table_connection_error(self, mock_get_connection):
        """Test delete table with connection error"""
        mock_get_connection.return_value = None  # Simulate no connection

        with patch("builtins.print") as mock_print:
            self.repo.delete_table()
            mock_print.assert_called_with("Not connected to the database.")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_delete_table_sql_error(self, mock_get_connection):
        """Test SQL error when deleting table"""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        mock_connection.cursor.side_effect = Error("SQL error")

        with patch("builtins.print") as mock_print:
            self.repo.delete_table()
            mock_print.assert_called_with("Error: SQL error")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_fetch_data_connection_error(self, mock_get_connection):
        """Test fetch data with connection error"""
        mock_get_connection.return_value = None  # Simulate no connection

        with patch("builtins.print") as mock_print:
            headers, results = self.repo.fetch_data()
            mock_print.assert_called_with("Not connected to the database.")
            self.assertEqual(headers, [])
            self.assertEqual(results, [])

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_fetch_data_sql_error(self, mock_get_connection):
        """Test SQL error when fetching data"""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        mock_connection.cursor.side_effect = Error("SQL error")

        with patch("builtins.print") as mock_print:
            headers, results = self.repo.fetch_data()
            mock_print.assert_called_with("Error: SQL error")
            self.assertEqual(headers, [])
            self.assertEqual(results, [])

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_update_db_for_user_connection_error(self, mock_get_connection):
        """Test update DB with connection error"""
        mock_get_connection.return_value = None  # Simulate no connection

        with patch("builtins.print") as mock_print:
            self.repo.update_db_for_user(["age"], {"age": ["30"]}, "year")
            mock_print.assert_called_with("Not connected to the database.")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_update_db_for_user_sql_error(self, mock_get_connection):
        """Test SQL error when updating DB for user"""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        mock_connection.cursor.side_effect = Error("SQL error")

        with patch("builtins.print") as mock_print:
            self.repo.update_db_for_user(["age"], {"age": ["30"]}, "year")
            mock_print.assert_called_with("Error: SQL error")

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_get_last_login_data_connection_error(self, mock_get_connection):
        """Test get last login data with connection error"""
        mock_get_connection.return_value = None  # Simulate no connection

        with patch("builtins.print") as mock_print:
            demographics, choices, time = self.repo.get_last_login_data()
            mock_print.assert_called_with("Not connected to the database.")
            self.assertIsNone(demographics)
            self.assertIsNone(choices)
            self.assertIsNone(time)

    @patch("app.repositories.sqlite_db_repo.DbConnectionManager.get_connection")
    def test_get_last_login_data_sql_error(self, mock_get_connection):
        """Test SQL error when fetching last login data"""
        mock_connection = MagicMock()
        mock_get_connection.return_value = mock_connection
        mock_connection.cursor.side_effect = Error("SQL error")

        with patch("builtins.print") as mock_print:
            demographics, choices, time = self.repo.get_last_login_data()
            mock_print.assert_called_with("Error: SQL error")
            self.assertIsNone(demographics)
            self.assertIsNone(choices)
            self.assertIsNone(time)


if __name__ == "__main__":
    unittest.main()
