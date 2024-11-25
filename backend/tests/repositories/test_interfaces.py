import unittest
from unittest.mock import MagicMock
from app.repositories.interfaces import DatabaseRepository, FileRepository, UserRepositoryInterface

class TestDatabaseRepository(unittest.TestCase):
    def setUp(self):
        """Set up the test case with mock data."""
        self.repo = MagicMock(spec=DatabaseRepository)

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
        self.repo = MagicMock(spec=FileRepository)

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
        self.repo.get_headers.return_value = ['header1', 'header2']
        headers = self.repo.get_headers()
        self.assertEqual(headers, ['header1', 'header2'])
        self.repo.get_headers.assert_called_once()

    def test_update_comparison_csv(self):
        """Test update_comparison_csv method."""
        demographics = ['age', 'gender']
        choices = {'choice1': ['option1']}
        time = '2024-01-01'
        self.repo.update_comparison_csv(demographics, choices, time)
        self.repo.update_comparison_csv.assert_called_once_with(demographics, choices, time)

    def test_get_data_for_time(self):
        """Test get_data_for_time method."""
        time = '2024-01-01'
        self.repo.get_data_for_time(time)
        self.repo.get_data_for_time.assert_called_once_with(time)


class TestUserRepositoryInterface(unittest.TestCase):
    def setUp(self):
        """Set up the test case with mock data."""
        self.repo = MagicMock(spec=UserRepositoryInterface)

    def test_get_user_by_email(self):
        """Test get_user_by_email method."""
        email = 'test@example.com'
        self.repo.get_user_by_email.return_value = {'email': email, 'name': 'Test User'}
        user = self.repo.get_user_by_email(email)
        self.assertEqual(user, {'email': email, 'name': 'Test User'})
        self.repo.get_user_by_email.assert_called_once_with(email)

    def test_create_user(self):
        """Test create_user method."""
        firstname = 'Test'
        lastname = 'User'
        email = 'test@example.com'
        password = 'password'
        self.repo.create_user(firstname, lastname, email, password)
        self.repo.create_user.assert_called_once_with(firstname, lastname, email, password)

    def test_get_user_by_email_and_password(self):
        """Test get_user_by_email_and_password method."""
        email = 'test@example.com'
        password = 'password'
        self.repo.get_user_by_email_and_password.return_value = {'email': email, 'name': 'Test User'}
        user = self.repo.get_user_by_email_and_password(email, password)
        self.assertEqual(user, {'email': email, 'name': 'Test User'})
        self.repo.get_user_by_email_and_password.assert_called_once_with(email, password)

    def test_update_password(self):
        """Test update_password method."""
        email = 'test@example.com'
        new_password = 'newpassword'
        self.repo.update_password(email, new_password)
        self.repo.update_password.assert_called_once_with(email, new_password)

    def test_process_shared_data(self):
        """Test process_shared_data method."""
        encoded_data = 'encoded_string'
        self.repo.process_shared_data.return_value = {'decoded': 'data'}
        result = self.repo.process_shared_data(encoded_data)
        self.assertEqual(result, {'decoded': 'data'})
        self.repo.process_shared_data.assert_called_once_with(encoded_data)