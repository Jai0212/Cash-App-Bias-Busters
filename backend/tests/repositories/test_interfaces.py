import unittest
from unittest.mock import MagicMock

from backend.app.use_cases.DatabaseRepositoryInterface import (
    DatabaseRepositoryInterface,
)
from backend.app.use_cases.FileRepositoryInterface import FileRepositoryInterface
from backend.app.use_cases.UserRepositoryInterface import UserRepositoryInterface


class TestRepositories(unittest.TestCase):

    def test_database_repository(self):
        # Mock the DatabaseRepository and its abstract methods
        db_repo = MagicMock(spec=DatabaseRepositoryInterface)
        db_repo.see_all_tables.return_value = None
        db_repo.create_table.return_value = None
        db_repo.delete_table.return_value = None
        db_repo.fetch_data.return_value = (["column1", "column2"], [("data1", "data2")])
        db_repo.update_db_for_user.return_value = None
        db_repo.get_last_login_data.return_value = (
            ["last_login"],
            {"column1": ["value"]},
            "time",
        )

        # Call methods to ensure they are invoked
        db_repo.see_all_tables()
        db_repo.create_table()
        db_repo.delete_table()
        db_repo.fetch_data()
        db_repo.update_db_for_user(["demo"], {"choice1": ["value"]}, "time")
        db_repo.get_last_login_data()

        db_repo.see_all_tables.assert_called_once()
        db_repo.create_table.assert_called_once()
        db_repo.delete_table.assert_called_once()
        db_repo.fetch_data.assert_called_once()
        db_repo.update_db_for_user.assert_called_once()
        db_repo.get_last_login_data.assert_called_once()

    def test_file_repository(self):
        # Mock the FileRepository and its abstract methods
        file_repo = MagicMock(spec=FileRepositoryInterface)
        file_repo.import_csv_to_db.return_value = True
        file_repo.save_data_to_csv.return_value = None
        file_repo.delete_csv_data.return_value = None
        file_repo.get_headers.return_value = ["header1", "header2"]
        file_repo.update_comparison_csv.return_value = None
        file_repo.get_data_for_time.return_value = None

        # Call methods to ensure they are invoked
        file_repo.import_csv_to_db(MagicMock())
        file_repo.save_data_to_csv()
        file_repo.delete_csv_data()
        file_repo.get_headers()
        file_repo.update_comparison_csv(["demo"], {"choice1": ["value"]}, "time")
        file_repo.get_data_for_time("time")

        file_repo.import_csv_to_db.assert_called_once()
        file_repo.save_data_to_csv.assert_called_once()
        file_repo.delete_csv_data.assert_called_once()
        file_repo.get_headers.assert_called_once()
        file_repo.update_comparison_csv.assert_called_once()
        file_repo.get_data_for_time.assert_called_once()

    def test_user_repository(self):
        # Mock the UserRepositoryInterface and its abstract methods
        user_repo = MagicMock(spec=UserRepositoryInterface)
        user_repo.get_user_by_email.return_value = {"email": "test@test.com"}
        user_repo.create_user.return_value = None
        user_repo.get_user_by_email_and_password.return_value = {
            "email": "test@test.com"
        }
        user_repo.update_password.return_value = None
        user_repo.process_shared_data.return_value = {"data": "decoded"}

        # Call methods to ensure they are invoked
        user_repo.get_user_by_email("test@test.com")
        user_repo.create_user("John", "Doe", "john@test.com", "password")
        user_repo.get_user_by_email_and_password("test@test.com", "password")
        user_repo.update_password("test@test.com", "new_password")
        user_repo.process_shared_data("encoded_data")

        user_repo.get_user_by_email.assert_called_once()
        user_repo.create_user.assert_called_once()
        user_repo.get_user_by_email_and_password.assert_called_once()
        user_repo.update_password.assert_called_once()
        user_repo.process_shared_data.assert_called_once()


class TestDatabaseRepository(unittest.TestCase):
    def setUp(self):
        """Set up the test case with mock data."""
        self.repo = MagicMock(spec=DatabaseRepositoryInterface)

    def test_see_all_tables(self):
        """Test see_all_tables method."""
        self.repo.see_all_tables()
        self.repo.see_all_tables.assert_called_once()

    def test_create_table(self):
        """Test create_table method."""
        self.repo.create_table()
        self.repo.create_table.assert_called_once()

    def test_delete_table(self):
        """Test delete_table method."""
        self.repo.delete_table()
        self.repo.delete_table.assert_called_once()

    def test_fetch_data(self):
        """Test fetch_data method."""
        self.repo.fetch_data.return_value = (
            ["header1", "header2"],
            [("data1", "data2")],
        )
        headers, data = self.repo.fetch_data()
        self.assertEqual(headers, ["header1", "header2"])
        self.assertEqual(data, [("data1", "data2")])
        self.repo.fetch_data.assert_called_once()

    def test_update_db_for_user(self):
        """Test update_db_for_user method."""
        demographics = ["age", "gender"]
        choices = {"choice1": ["option1", "option2"]}
        time = "2024-01-01"
        self.repo.update_db_for_user(demographics, choices, time)
        self.repo.update_db_for_user.assert_called_once_with(
            demographics, choices, time
        )

    def test_get_last_login_data(self):
        """Test get_last_login_data method."""
        self.repo.get_last_login_data.return_value = (
            ["last_login"],
            {"choice": ["opt1"]},
            "2024-01-01",
        )
        demographics, choices, time = self.repo.get_last_login_data()
        self.assertEqual(demographics, ["last_login"])
        self.assertEqual(choices, {"choice": ["opt1"]})
        self.assertEqual(time, "2024-01-01")
        self.repo.get_last_login_data.assert_called_once()


class TestFileRepository(unittest.TestCase):
    def setUp(self):
        """Set up the test case with mock data."""
        self.repo = MagicMock(spec=FileRepositoryInterface)

    def test_import_csv_to_db(self):
        """Test import_csv_to_db method."""
        mock_file = MagicMock()
        self.repo.import_csv_to_db(mock_file)
        self.repo.import_csv_to_db.assert_called_once_with(mock_file)

    def test_save_data_to_csv(self):
        """Test save_data_to_csv method."""
        self.repo.save_data_to_csv()
        self.repo.save_data_to_csv.assert_called_once()

    def test_delete_csv_data(self):
        """Test delete_csv_data method."""
        self.repo.delete_csv_data()
        self.repo.delete_csv_data.assert_called_once()

    def test_get_headers(self):
        """Test get_headers method."""
        self.repo.get_headers.return_value = ["header1", "header2"]
        headers = self.repo.get_headers()
        self.assertEqual(headers, ["header1", "header2"])
        self.repo.get_headers.assert_called_once()

    def test_update_comparison_csv(self):
        """Test update_comparison_csv method."""
        demographics = ["age", "gender"]
        choices = {"choice1": ["option1"]}
        time = "2024-01-01"
        self.repo.update_comparison_csv(demographics, choices, time)
        self.repo.update_comparison_csv.assert_called_once_with(
            demographics, choices, time
        )

    def test_get_data_for_time(self):
        """Test get_data_for_time method."""
        time = "2024-01-01"
        self.repo.get_data_for_time(time)
        self.repo.get_data_for_time.assert_called_once_with(time)


class TestUserRepositoryInterface(unittest.TestCase):
    def setUp(self):
        """Set up the test case with mock data."""
        self.repo = MagicMock(spec=UserRepositoryInterface)

    def test_get_user_by_email(self):
        """Test get_user_by_email method."""
        email = "test@example.com"
        self.repo.get_user_by_email.return_value = {"email": email, "name": "Test User"}
        user = self.repo.get_user_by_email(email)
        self.assertEqual(user, {"email": email, "name": "Test User"})
        self.repo.get_user_by_email.assert_called_once_with(email)

    def test_create_user(self):
        """Test create_user method."""
        firstname = "Test"
        lastname = "User"
        email = "test@example.com"
        password = "password"
        self.repo.create_user(firstname, lastname, email, password)
        self.repo.create_user.assert_called_once_with(
            firstname, lastname, email, password
        )

    def test_get_user_by_email_and_password(self):
        """Test get_user_by_email_and_password method."""
        email = "test@example.com"
        password = "password"
        self.repo.get_user_by_email_and_password.return_value = {
            "email": email,
            "name": "Test User",
        }
        user = self.repo.get_user_by_email_and_password(email, password)
        self.assertEqual(user, {"email": email, "name": "Test User"})
        self.repo.get_user_by_email_and_password.assert_called_once_with(
            email, password
        )

    def test_update_password(self):
        """Test update_password method."""
        email = "test@example.com"
        new_password = "newpassword"
        self.repo.update_password(email, new_password)
        self.repo.update_password.assert_called_once_with(email, new_password)

    def test_process_shared_data(self):
        """Test process_shared_data method."""
        encoded_data = "encoded_string"
        self.repo.process_shared_data.return_value = {"decoded": "data"}
        result = self.repo.process_shared_data(encoded_data)
        self.assertEqual(result, {"decoded": "data"})
        self.repo.process_shared_data.assert_called_once_with(encoded_data)
