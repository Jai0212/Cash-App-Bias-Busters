import unittest
from app.controllers.app import app
from flask import jsonify
from unittest.mock import patch, MagicMock
import os


class FlaskAppTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def setUp(self):
        self.headers = {"Content-Type": "application/json"}

    @patch('app.controllers.app.initialize')
    def test_headers_missing_curr_user(self, mock_initialize):
        data = {}
        mock_initialize.return_value = None
        response = self.client.post('/api/headers', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch('app.controllers.app.initialize')
    def test_headers_missing_table(self, mock_initialize):
        data = {"curr_user": "test_user"}
        mock_initialize.return_value = None
        with patch('app.controllers.app.user.table_name', None):
            response = self.client.post('/api/headers', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    def test_signup_missing_password(self):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "",
            "confirmPassword": ""
        }
        response = self.client.post('/signup', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)

    @patch('app.controllers.app.RegisterUserInteractor')
    def test_signup_success(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "securepassword123",
            "confirmPassword": "securepassword123"
        }

        mock_register_interactor.return_value.execute.return_value = {
            "message": "User registered successfully"
        }

        response = self.client.post('/signup', json=data, headers=self.headers)

        self.assertEqual(response.status_code, 201)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "User registered successfully")
        self.assertFalse(response.json["error"])
        self.assertEqual(response.json["code"], 3)

    @patch('app.controllers.app.RegisterUserInteractor')
    def test_signup_value_error(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "invalid-email",
            "password": "password123",
            "confirmPassword": "password123"
        }

        mock_register_interactor.return_value.execute.side_effect = ValueError("Invalid email format")

        response = self.client.post('/signup', json=data, headers=self.headers)

        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Invalid email format")
        self.assertTrue(response.json["error"])
        self.assertEqual(response.json["code"], 2)

    @patch('app.controllers.app.RegisterUserInteractor')
    def test_signup_generic_exception(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "password123",
            "confirmPassword": "password123"
        }

        mock_register_interactor.return_value.execute.side_effect = Exception("Unexpected error")

        response = self.client.post('/signup', json=data, headers=self.headers)

        self.assertEqual(response.status_code, 500)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Unexpected error")
        self.assertTrue(response.json["error"])
        self.assertEqual(response.json["code"], 2)

    def test_login_missing_email_and_password(self):
        response = self.client.post("/login", json={})

        response_data = response.get_json()

        self.assertEqual(response.status_code, 400)

        self.assertEqual(response_data["code"], 2)
        self.assertTrue(response_data["error"])
        self.assertEqual(response_data["message"], "Email and Password are required")

    def test_login_success(self):
        data = {"email": "test@example.com", "password": "password123"}
        response = self.client.post('/login', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)

    def test_login_failure(self):
        data = {"email": "test@example.com", "password": "wrongpassword"}
        response = self.client.post('/login', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("message", response.json)

    def test_logout(self):
        data = {"curr_user": "test_user"}
        response = self.client.post('/logout', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)

    @patch('app.controllers.app.initialize')
    @patch('app.controllers.app.UploadData')
    def test_upload_data_missing_csv(self, mock_upload_data, mock_initialize):
        data = {"curr_user": "test_user"}
        mock_initialize.return_value = None
        response = self.client.post('/api/upload-data', data=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch('app.controllers.app.initialize')
    @patch('app.controllers.app.UploadData')
    def test_upload_data_missing_curr_user(self, mock_upload_data, mock_initialize):
        data = {"csv_to_read": "file.csv"}
        mock_initialize.return_value = None
        response = self.client.post('/api/upload-data', data=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch('app.controllers.app.initialize')
    def test_upload_model_missing_data(self, mock_initialize):
        data = {
            "curr_user": "test_user",
            "dashboard": "test_dashboard"
        }
        mock_initialize.return_value = None
        response = self.client.post('/api/upload-model',
                                    data=data,
                                    headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch('app.controllers.app.initialize')
    def test_upload_model_invalid_file_format(self, mock_initialize):
        data = {
            "curr_user": "test_user",
            "dashboard": "test_dashboard"
        }
        with open('invalid_file.txt', 'w') as f:
            f.write("dummy data")

        with open('invalid_file.txt', 'rb') as f:
            response = self.client.post('/api/upload-model',
                                        data={"curr_user": "test_user", "dashboard": "test_dashboard", "model_file": f},
                                        headers=self.headers)

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], 'Missing required data.')

    @patch('app.controllers.app.initialize')
    def test_upload_model_missing_file(self, mock_initialize):
        data = {
            "curr_user": "test_user",
            "dashboard": "test_dashboard"
        }
        mock_initialize.return_value = None
        response = self.client.post('/api/upload-model',
                                    data=data,
                                    headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch('app.controllers.app.ChangePasswordInteractor')
    def test_change_password_missing_fields(self, mock_change_password_interactor):
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "new_password123"
        }

        # Test case where email is missing
        response = self.client.post('/change_password', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where old password is missing
        data["email"] = "test@example.com"
        data["old_password"] = ""
        response = self.client.post('/change_password', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where new password is missing
        data["old_password"] = "old_password123"
        data["new_password"] = ""
        response = self.client.post('/change_password', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where confirm password is missing
        data["new_password"] = "new_password123"
        data["confirm_password"] = ""
        response = self.client.post('/change_password', json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

    @patch('app.controllers.app.current_user_email', 'test@example.com')  # Mocking the global variable
    @patch('app.controllers.app.ChangePasswordInteractor')
    def test_change_password_mismatched_passwords(self, mock_change_password_interactor):
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "different_password123"
        }

        # Simulating the scenario where the new password and confirm password do not match
        mock_change_password_interactor.return_value.execute.side_effect = ValueError(
            "New password and confirm password do not match")

        # Sending a request to change the password
        response = self.client.post('/change_password', json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "New password and confirm password do not match")

    @patch('app.controllers.app.current_user_email', 'test@example.com')  # Mocking global variable
    @patch('app.controllers.app.ChangePasswordInteractor')
    def test_change_password_success(self, mock_change_password_interactor):
        data = {
            "old_password": "oldpassword123",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123"
        }

        # Simulating a successful password change
        mock_change_password_interactor.return_value.execute.return_value = {"message": "Password changed successfully"}

        response = self.client.post('/change_password', json=data, headers=self.headers)

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Password changed successfully")

    @patch('app.controllers.app.current_user_email', 'test@example.com')  # Mocking the global variable
    @patch('app.controllers.app.ChangePasswordInteractor')
    def test_change_password_failure(self, mock_change_password_interactor):
        data = {
            "old_password": "wrong_old_password",
            "new_password": "new_password123",
            "confirm_password": "new_password123"
        }

        # Simulating the failure of the old password check
        mock_change_password_interactor.return_value.execute.side_effect = ValueError("Invalid old password")

        # Sending a request to change the password
        response = self.client.post('/change_password', json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Invalid old password")

    @patch('app.controllers.app.current_user_email', 'testuser@example.com')  # Mocking the global variable
    @patch('app.controllers.app.ChangePasswordInteractor')
    def test_change_password_exception(self, mock_change_password_interactor):
        # Simulating an unexpected exception
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "new_password123"
        }

        # Mocking the ChangePasswordInteractor to raise an exception
        mock_change_password_interactor.return_value.execute.side_effect = Exception("Something went wrong")

        # Sending a request to change the password
        response = self.client.post('/change_password', json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 500)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Something went wrong")

    @patch("app.controllers.app.Share")
    @patch("app.controllers.app.Generate")
    @patch("app.controllers.app.initialize")
    def test_share_success(self, mock_initialize, mock_generate, mock_share):
        # Mock data for Share
        mock_share.return_value.execute.return_value = {
            "currUser": "test_user",
            "selectedDemographic": "Age",
            "secondSelectedDemographic": "Gender",
            "selectedValues": ["20-30", "30-40"],
            "selectedSecondValues": ["Male", "Female"],
            "timeframe": "2023"
        }

        # Mock data for Generate
        mock_generate.return_value.execute.return_value = [
            MagicMock(
                get_feature1=lambda: "feature1_value",
                get_feature2=lambda: "feature2_value",
                get_accuracy=lambda: 0.95,
                get_false_positive_rate=lambda: 0.05,
                get_false_negative_rate=lambda: 0.02,
                get_combination_label=lambda: "Age: 20-30, Gender: Male"
            )
        ]

        encoded_data = "valid_encoded_data"
        response = self.client.get(f"/share/{encoded_data}", headers=self.headers)

        self.assertEqual(response.status_code, 200)
        self.assertIn("graph_data", response.json)
        self.assertIn("other_data", response.json)

        # Assertions for graph_data
        graph_data = response.json["graph_data"]
        self.assertIsInstance(graph_data, list)
        self.assertGreater(len(graph_data), 0)
        self.assertEqual(graph_data[0]["feature1"], "feature1_value")
        self.assertEqual(graph_data[0]["feature2"], "feature2_value")
        self.assertEqual(graph_data[0]["accuracy"], 0.95)
        self.assertEqual(graph_data[0]["falsepositive"], 0.05)
        self.assertEqual(graph_data[0]["falsenegative"], 0.02)
        self.assertEqual(graph_data[0]["combination_label"], "Age: 20-30, Gender: Male")

    @patch("app.controllers.app.Share")
    def test_share_failure_invalid_data(self, mock_share):
        # Simulating an exception during Share execution
        mock_share.side_effect = Exception("Failed to decode encoded data")

        encoded_data = "invalid_encoded_data"
        response = self.client.get(f"/share/{encoded_data}", headers=self.headers)

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Failed to decode or parse data")
        self.assertEqual(response.json["message"], "Failed to decode encoded data")

    class MainBlockTestCase(unittest.TestCase):
        @patch("app.controllers.app.app.run")
        def test_main_block(self, mock_run):
            with patch("sys.argv", ["app/controllers/app.py"]):
                import app.controllers.app

            mock_run.assert_called_once_with(debug=True, host="127.0.0.1", port=5000)

    def test_home_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode('utf-8'), "Welcome to the Backend!")

    @patch('app.controllers.app.current_user_email', None)  # Simulate no user logged in
    def test_get_email_no_user(self):
        response = self.client.get("/get-email")

        self.assertEqual(response.status_code, 401)

        response_data = response.get_json()
        self.assertTrue(response_data['error'])
        self.assertEqual(response_data['message'], "No user is logged in.")

    @patch('app.controllers.app.current_user_email', 'testuser@example.com')  # Simulate a user logged in
    def test_get_email_with_user(self):
        response = self.client.get("/get-email")

        self.assertEqual(response.status_code, 200)

        response_data = response.get_json()
        self.assertEqual(response_data['email'], 'testuser@example.com')



if __name__ == '__main__':
    unittest.main()
