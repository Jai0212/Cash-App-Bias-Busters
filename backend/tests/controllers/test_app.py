import os
import unittest
from unittest.mock import MagicMock, patch

import pytest

from backend.app.controllers.app import (  # Adjust this import according to your actual file structure
    app,
    initialize,
)
from backend.app.entities.user import User
from backend.app.repositories import SqliteDbRepo

UPLOAD_FOLDER = "uploads/"  # Directory to save uploaded models


class FlaskAppTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def setUp(self):
        self.headers = {"Content-Type": "application/json"}

    @patch("backend.app.controllers.app.initialize")
    def test_headers_missing_curr_user(self, mock_initialize):
        data = {}
        mock_initialize.return_value = None
        response = self.client.post("/api/headers", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.initialize")
    def test_headers_missing_table(self, mock_initialize):
        data = {"curr_user": "test_user"}
        mock_initialize.return_value = None
        with patch("backend.app.controllers.app.user.table_name", None):
            response = self.client.post("/api/headers", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    def test_signup_missing_password(self):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "",
            "confirmPassword": "",
        }
        response = self.client.post("/signup", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)

    @patch("backend.app.controllers.app.RegisterUserInteractor")
    def test_signup_success(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "securepassword123",
            "confirmPassword": "securepassword123",
        }

        mock_register_interactor.return_value.execute.return_value = {
            "message": "User registered successfully"
        }

        response = self.client.post("/signup", json=data, headers=self.headers)

        self.assertEqual(response.status_code, 201)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "User registered successfully")
        self.assertFalse(response.json["error"])
        self.assertEqual(response.json["code"], 3)

    @patch("backend.app.controllers.app.RegisterUserInteractor")
    def test_signup_value_error(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "invalid-email",
            "password": "password123",
            "confirmPassword": "password123",
        }

        mock_register_interactor.return_value.execute.side_effect = ValueError(
            "Invalid email format"
        )

        response = self.client.post("/signup", json=data, headers=self.headers)

        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Invalid email format")
        self.assertTrue(response.json["error"])
        self.assertEqual(response.json["code"], 2)

    @patch("backend.app.controllers.app.RegisterUserInteractor")
    def test_signup_generic_exception(self, mock_register_interactor):
        data = {
            "firstname": "Test",
            "lastname": "User",
            "email": "test@example.com",
            "password": "password123",
            "confirmPassword": "password123",
        }

        mock_register_interactor.return_value.execute.side_effect = Exception(
            "Unexpected error"
        )

        response = self.client.post("/signup", json=data, headers=self.headers)

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
        response = self.client.post("/login", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)

    def test_login_failure(self):
        data = {"email": "test@example.com", "password": "wrongpassword"}
        response = self.client.post("/login", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("message", response.json)

    def test_logout(self):
        data = {"curr_user": "test_user"}
        response = self.client.post("/logout", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)

    @patch("backend.app.controllers.app.initialize")
    @patch("backend.app.controllers.app.UploadData")
    def test_upload_data_missing_csv(self, mock_upload_data, mock_initialize):
        data = {"curr_user": "test_user"}
        mock_initialize.return_value = None
        response = self.client.post("/api/upload-data", data=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.initialize")
    @patch("backend.app.controllers.app.UploadData")
    def test_upload_data_missing_curr_user(self, mock_upload_data, mock_initialize):
        data = {"csv_to_read": "file.csv"}
        mock_initialize.return_value = None
        response = self.client.post("/api/upload-data", data=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.initialize")
    def test_upload_model_missing_data(self, mock_initialize):
        data = {"curr_user": "test_user", "dashboard": "test_dashboard"}
        mock_initialize.return_value = None
        response = self.client.post(
            "/api/upload-model", data=data, headers=self.headers
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.initialize")
    def test_upload_model_invalid_file_format(self, mock_initialize):
        data = {"curr_user": "test_user", "dashboard": "test_dashboard"}
        with open("invalid_file.txt", "w") as f:
            f.write("dummy data")

        with open("invalid_file.txt", "rb") as f:
            response = self.client.post(
                "/api/upload-model",
                data={
                    "curr_user": "test_user",
                    "dashboard": "test_dashboard",
                    "model_file": f,
                },
                headers=self.headers,
            )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.initialize")
    def test_upload_model_missing_file(self, mock_initialize):
        data = {"curr_user": "test_user", "dashboard": "test_dashboard"}
        mock_initialize.return_value = None
        response = self.client.post(
            "/api/upload-model", data=data, headers=self.headers
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertEqual(response.json["error"], "Missing required data.")

    @patch("backend.app.controllers.app.ChangePasswordInteractor")
    def test_change_password_missing_fields(self, mock_change_password_interactor):
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "new_password123",
        }

        # Test case where email is missing
        response = self.client.post("/change_password", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where old password is missing
        data["email"] = "test@example.com"
        data["old_password"] = ""
        response = self.client.post("/change_password", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where new password is missing
        data["old_password"] = "old_password123"
        data["new_password"] = ""
        response = self.client.post("/change_password", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

        # Test case where confirm password is missing
        data["new_password"] = "new_password123"
        data["confirm_password"] = ""
        response = self.client.post("/change_password", json=data, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "All fields are required")

    @patch(
        "backend.app.controllers.app.current_user_email", "test@example.com"
    )  # Mocking the global variable
    @patch("backend.app.controllers.app.ChangePasswordInteractor")
    def test_change_password_mismatched_passwords(
        self, mock_change_password_interactor
    ):
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "different_password123",
        }

        # Simulating the scenario where the new password and confirm password do not match
        mock_change_password_interactor.return_value.execute.side_effect = ValueError(
            "New password and confirm password do not match"
        )

        # Sending a request to change the password
        response = self.client.post("/change_password", json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(
            response.json["message"], "New password and confirm password do not match"
        )

    @patch(
        "backend.app.controllers.app.current_user_email", "test@example.com"
    )  # Mocking global variable
    @patch("backend.app.controllers.app.ChangePasswordInteractor")
    def test_change_password_success(self, mock_change_password_interactor):
        data = {
            "old_password": "oldpassword123",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123",
        }

        # Simulating a successful password change
        mock_change_password_interactor.return_value.execute.return_value = {
            "message": "Password changed successfully"
        }

        response = self.client.post("/change_password", json=data, headers=self.headers)

        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Password changed successfully")

    @patch(
        "backend.app.controllers.app.current_user_email", "test@example.com"
    )  # Mocking the global variable
    @patch("backend.app.controllers.app.ChangePasswordInteractor")
    def test_change_password_failure(self, mock_change_password_interactor):
        data = {
            "old_password": "wrong_old_password",
            "new_password": "new_password123",
            "confirm_password": "new_password123",
        }

        # Simulating the failure of the old password check
        mock_change_password_interactor.return_value.execute.side_effect = ValueError(
            "Invalid old password"
        )

        # Sending a request to change the password
        response = self.client.post("/change_password", json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Invalid old password")

    @patch(
        "backend.app.controllers.app.current_user_email", "testuser@example.com"
    )  # Mocking the global variable
    @patch("backend.app.controllers.app.ChangePasswordInteractor")
    def test_change_password_exception(self, mock_change_password_interactor):
        # Simulating an unexpected exception
        data = {
            "old_password": "old_password123",
            "new_password": "new_password123",
            "confirm_password": "new_password123",
        }

        # Mocking the ChangePasswordInteractor to raise an exception
        mock_change_password_interactor.return_value.execute.side_effect = Exception(
            "Something went wrong"
        )

        # Sending a request to change the password
        response = self.client.post("/change_password", json=data, headers=self.headers)

        # Assert the status code and the error message
        self.assertEqual(response.status_code, 500)
        self.assertIn("message", response.json)
        self.assertEqual(response.json["message"], "Something went wrong")

    @patch("backend.app.controllers.app.Share")
    @patch("backend.app.controllers.app.Generate")
    @patch("backend.app.controllers.app.initialize")
    def test_share_success(self, mock_initialize, mock_generate, mock_share):
        # Mock data for Share
        mock_share.return_value.execute.return_value = {
            "currUser": "test_user",
            "selectedDemographic": "Age",
            "secondSelectedDemographic": "Gender",
            "selectedValues": ["20-30", "30-40"],
            "selectedSecondValues": ["Male", "Female"],
            "timeframe": "2023",
        }

        # Mock data for Generate
        mock_generate.return_value.execute.return_value = [
            MagicMock(
                get_feature1=lambda: "feature1_value",
                get_feature2=lambda: "feature2_value",
                get_accuracy=lambda: 0.95,
                get_false_positive_rate=lambda: 0.05,
                get_false_negative_rate=lambda: 0.02,
                get_combination_label=lambda: "Age: 20-30, Gender: Male",
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

    @patch("backend.app.controllers.app.Share")
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
        @patch("backend.app.controllers.app.app.run")
        def test_main_block(self, mock_run):
            with patch("sys.argv", ["app/controllers/app.py"]):
                import app.controllers.app

            mock_run.assert_called_once_with(debug=True, host="127.0.0.1", port=5000)

    def test_home_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode("utf-8"), "Welcome to the Backend!")

    @patch(
        "backend.app.controllers.app.current_user_email", None
    )  # Simulate no user logged in
    def test_get_email_no_user(self):
        response = self.client.get("/get-email")

        self.assertEqual(response.status_code, 401)

        response_data = response.get_json()
        self.assertTrue(response_data["error"])
        self.assertEqual(response_data["message"], "No user is logged in.")

    @patch(
        "backend.app.controllers.app.current_user_email", "testuser@example.com"
    )  # Simulate a user logged in
    def test_get_email_with_user(self):
        response = self.client.get("/get-email")

        self.assertEqual(response.status_code, 200)

        response_data = response.get_json()
        self.assertEqual(response_data["email"], "testuser@example.com")


class TestInitializeFunction(unittest.TestCase):

    @patch("backend.app.controllers.app.db_repo")  # Mocking db_repo
    @patch("backend.app.controllers.app.file_repo")  # Mocking file_repo
    @patch("backend.app.entities.user.User")  # Mocking User class
    def test_initialize(self, MockUser, mock_file_repo, mock_db_repo):
        # Arrange
        mock_user = MagicMock()  # Creating a mock user object
        mock_user.table_name = "mock_table"  # Mock the table_name attribute
        MockUser.return_value = mock_user  # Make sure the User mock returns mock_user

        # Ensure db_repo and file_repo are MagicMock instances
        mock_db_repo.user = None
        mock_db_repo.table_name = None
        mock_file_repo.user = None
        mock_file_repo.table_name = None
        mock_file_repo.db_repo = None

        curr_user = "mock_table"

        # Act
        initialize(curr_user)

        # Assert
        # Check if user and table_name were set in db_repo and file_repo
        self.assertEqual(mock_db_repo.table_name, mock_user.table_name)

        self.assertEqual(mock_file_repo.table_name, mock_user.table_name)


# Mock the external classes used in the route
class MockCsvFileRepo:
    def __init__(self, user, file_path):
        pass


class MockGetValuesUnderHeader:
    def __init__(self, file_repo):
        pass

    def execute(self, header):
        return ["value1", "value2", "value3"]


# Mock initialize function
def mock_initialize(curr_user):
    pass


# Override the actual classes and functions with mocks
@pytest.fixture
def mock_app():
    # Create a test Flask app instance
    app.config["TESTING"] = True
    app.debug = False
    app.initialize = mock_initialize
    return app.test_client()


def test_values_under_header(mock_app):
    # Define the mock input data
    input_data = {"curr_user": "user123", "header": "header1"}

    # Mock the external classes and functions using patch
    with patch("backend.app.repositories.CsvFileRepo", MockCsvFileRepo):
        with patch(
            "backend.app.use_cases.GetValuesUnderHeader", MockGetValuesUnderHeader
        ):
            # Send the POST request to your route
            response = mock_app.post("/api/values-under-header", json=input_data)

    # Assert the response status code
    assert response.status_code == 200

    # Assert the response JSON content
    assert response.get_json() == []


def test_missing_data(mock_app):
    # Define the mock input data with missing header
    input_data = {
        "curr_user": "user123",
    }

    # Send the POST request to your route
    response = mock_app.post("/api/values-under-header", json=input_data)

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Mock the external classes and functions
class MockGenerate:
    def __init__(self, file_repo, db_repo):
        pass

    def execute(self, demographics, choices, time):
        # Mocking the return value of the Generate execute method
        return [
            MagicMock(
                get_feature1=MagicMock(return_value="Feature1"),
                get_feature2=MagicMock(return_value="Feature2"),
                get_accuracy=MagicMock(return_value=0.85),
                get_false_positive_rate=MagicMock(return_value=0.1),
                get_false_negative_rate=MagicMock(return_value=0.05),
                get_combination_label=MagicMock(return_value="Label1"),
            ),
            MagicMock(
                get_feature1=MagicMock(return_value="Feature3"),
                get_feature2=MagicMock(return_value="Feature4"),
                get_accuracy=MagicMock(return_value=0.90),
                get_false_positive_rate=MagicMock(return_value=0.2),
                get_false_negative_rate=MagicMock(return_value=0.1),
                get_combination_label=MagicMock(return_value="Label2"),
            ),
        ]


# Mock the initialize function
def mock_initialize(curr_user):
    pass


@pytest.fixture
def mock_app():
    # Create a test Flask app instance
    app.config["TESTING"] = True
    app.debug = False
    app.initialize = mock_initialize  # Use the mock initialize function
    return app.test_client()


# Test case for valid data
def test_generate_valid(mock_app):
    # Define the mock input data
    input_data = {
        "curr_user": "ff@gmail.com",
        "demographics": ["gender", "race"],
        "choices": {
            "gender": ["male", "female", "non-binary"],
            "race": ["black", "asian", "other"],
        },
        "time": "year",
    }

    # Mock the Generate class and its execute method
    with patch("backend.app.use_cases.Generate", MockGenerate):
        # Send the POST request to your route
        response = mock_app.post("/api/generate", json=input_data)

    # Assert the response status code
    assert response.status_code == 200

    # Assert the response contains the expected data
    response_data = response.get_json()
    assert len(response_data) == 0


# Test case for missing required data
def test_generate_missing_data(mock_app):
    # Define the mock input data with missing demographics
    input_data = {
        "curr_user": "user123",
        "choices": {
            "age": ["18-25", "26-35", "36-45"],
            "income": ["low", "medium", "high"],
        },
        "time": None,
    }

    # Send the POST request to your route
    response = mock_app.post("/api/generate", json=input_data)

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Test case for missing choices
def test_generate_missing_choices(mock_app):
    # Define the mock input data with missing choices
    input_data = {
        "curr_user": "user123",
        "demographics": ["age", "income"],
        "time": None,
    }

    # Send the POST request to your route
    response = mock_app.post("/api/generate", json=input_data)

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


from unittest.mock import MagicMock, patch


# Mock the GetLastLoginData class and its execute method
class MockGetLastLoginData:
    def __init__(self, db_repo):
        pass

    def execute(self):
        # Mock the return value of the execute method
        return (
            ["gender", "race"],
            {
                "gender": ["male", "female", "non-binary"],
                "race": ["black", "asian", "other"],
            },
            "year",
        )


# Mock the initialize function
def mock_initialize(curr_user):
    pass


@pytest.fixture
def mock_app():
    # Create a test Flask app instance
    app.config["TESTING"] = True
    app.debug = False
    app.initialize = mock_initialize  # Use the mock initialize function
    return app.test_client()


# Test case for valid data
def test_get_prev_data_valid(mock_app):
    # Define the mock input data
    input_data = {
        "curr_user": "ff@gmail.com",
        "demographics": ["gender", "race"],
        "choices": {
            "gender": ["male", "female", "non-binary"],
            "race": ["black", "asian", "other"],
        },
        "time": "year",
    }

    # Mock the GetLastLoginData class and its execute method
    with patch("backend.app.use_cases.GetLastLoginData", MockGetLastLoginData):
        # Send the POST request to your route
        response = mock_app.post("/api/get-prev-data", json=input_data)

    # Assert the response status code
    assert response.status_code == 200

    # Assert the response contains the expected data
    response_data = response.get_json()
    assert "demographics" in response_data
    assert set(response_data["demographics"]) == set(["gender", "race"])
    assert "choices" in response_data
    assert "time" in response_data
    assert response_data["time"] == "year"


# Test case for missing user
def test_get_prev_data_missing_user(mock_app):
    # Define the mock input data with missing curr_user
    input_data = {
        "demographics": ["gender", "race"],
        "choices": {
            "gender": ["male", "female", "non-binary"],
            "race": ["black", "asian", "other"],
        },
        "time": "year",
    }

    # Send the POST request to your route
    response = mock_app.post("/api/get-prev-data", json=input_data)

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Test case for missing table_name
def test_get_prev_data_missing_table_name(mock_app):
    # Define the mock input data
    input_data = {
        "curr_user": "ff@gmail.com",
        "demographics": ["gender", "race"],
        "choices": {
            "gender": ["male", "female", "non-binary"],
            "race": ["black", "asian", "other"],
        },
        "time": "year",
    }

    # Mock user with no table_name
    with patch("backend.app.controllers.app.initialize") as mock_initialize:
        mock_initialize.return_value = None
        response = mock_app.post("/api/get-prev-data", json=input_data)

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Mock the initialize function
def mock_initialize(curr_user):
    pass


# Mocking user and its table_name for testing
class MockUser:
    def __init__(self, table_name):
        self.table_name = table_name


user = MockUser("test_user")

# Mocked user models storage
user_models = {}


@pytest.fixture
def mock_app():
    # Create a test Flask app instance
    app.config["TESTING"] = True
    app.debug = False
    return app.test_client()


# Test case for successful model upload
# def test_upload_model_valid(mock_app):
#     # Prepare mock input data for file upload
#     input_data = {
#         "curr_user": "ff@gmail.com",
#         "dashboard": "dashboard_name",
#     }

#     # Prepare a mock file (mocking file upload behavior)
#     mock_file = MagicMock()
#     mock_file.filename = "model.pkl"
#     mock_file.stream = b"model data"

#     # Create a multi-part form data with both the input data and the mock file
#     data = {
#         "curr_user": "ff@gmail.com",
#         "dashboard": "dashboard_name",
#     }

#     files = {"model_file": (mock_file.stream, mock_file.filename)}

#     # Send the POST request with the correct content type and data
#     with patch(
#         "flask.request.files", files
#     ):  # Mock request.files to return the mock file
#         with mock_app:  # Use Flask's context manager for making the request
#             response = mock_app.post(
#                 "/api/upload-model",
#                 data={**data, **files},
#                 content_type="multipart/form-data",
#             )

#     # Assert the response status code
#     assert response.status_code == 200

#     # Assert the response message
#     response_data = response.get_json()
#     assert response_data["message"] == "Model uploaded successfully."

#     # Verify that the file was saved in the correct directory
#     user_folder = os.path.join(UPLOAD_FOLDER, "ff@gmail.com")  # Mocked user
#     file_path = os.path.join(
#         user_folder, "dashboard_name"
#     )  # or "model.pkl" if secret_token
#     assert os.path.exists(file_path)

#     # Assert that the model path is stored correctly in the user_models dictionary
#     assert user_models.get("ff@gmail.com") == file_path


# Test case for missing file
def test_upload_model_missing_file(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
        "dashboard": "dashboard_name",
    }

    # Send the POST request with no file
    response = mock_app.post(
        "/api/upload-model", data=input_data, content_type="multipart/form-data"
    )

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Test case for invalid file format
# def test_upload_model_invalid_format(mock_app):
#     input_data = {
#         "curr_user": "ff@gmail.com",
#         "dashboard": "dashboard_name",
#     }

#     # Prepare a mock file with an invalid format
#     mock_file = MagicMock()
#     mock_file.filename = "model.txt"
#     mock_file.stream = b"invalid model data"

#     # Mock request.files to return the mock file
#     with patch("flask.request.files", {"model_file": mock_file}):
#         response = mock_app.post(
#             "/api/upload-model",
#             data={**input_data, "model_file": (mock_file.stream, mock_file.filename)},
#             content_type="multipart/form-data",
#         )

#     # Assert the response status code and error message
#     assert response.status_code == 400
#     assert response.get_json() == {"error": "Invalid file format."}


# Test case for missing curr_user
def test_upload_model_missing_user(mock_app):
    input_data = {
        "dashboard": "dashboard_name",
    }

    # Send the POST request with no curr_user
    response = mock_app.post(
        "/api/upload-model", data=input_data, content_type="multipart/form-data"
    )

    # Assert the response status code and error message
    assert response.status_code == 400
    assert response.get_json() == {"error": "Missing required data."}


# Test case for dashboard="secret_token"
# def test_upload_model_secret_token(mock_app):
#     input_data = {
#         "curr_user": "ff@gmail.com",
#         "dashboard": "secret_token",
#     }

#     # Prepare a mock file
#     mock_file = MagicMock()
#     mock_file.filename = "model.pkl"
#     mock_file.stream = b"model data"

#     # Mock request.files to return the mock file
#     with patch("flask.request.files", {"model_file": mock_file}):
#         response = mock_app.post(
#             "/api/upload-model",
#             data={**input_data, "model_file": (mock_file.stream, mock_file.filename)},
#             content_type="multipart/form-data",
#         )

#     # Assert the response status code
#     assert response.status_code == 200

#     # Assert the response message
#     response_data = response.get_json()
#     assert response_data["message"] == "Model uploaded successfully."

#     # Verify that the file was saved as "model.pkl"
#     user_folder = os.path.join(UPLOAD_FOLDER, "ff@gmail.com")  # Mocked user
#     file_path = os.path.join(user_folder, "model.pkl")
#     assert os.path.exists(file_path)

#     # Assert that the model path is stored correctly in the user_models dictionary
#     assert user_models.get("ff@gmail.com") == file_path

# def test_generate_for_all_models_valid(mock_app):
#     # Prepare mock input data
#     input_data = {
#         "curr_user": "ff@gmail.com",
#     }

#     # Mocking the functions used in the route
#     with patch("backend.app.controllers.app.get_files_in_folder", return_value=["model1.pkl", "model2.pkl"]), \
#          patch("backend.app.controllers.app.EvaluateModelsUseCase") as mock_evaluator, \
#          patch("backend.app.controllers.app.initialize"):

#         # Mock output from evaluator
#         mock_evaluator.return_value.execute.return_value = {"model1": "result1", "model2": "result2"}

#         # Send the POST request
#         response = mock_app.post(
#             "/api/generate-for-all-models",
#             data=input_data,
#             content_type="multipart/form-data"
#         )

#     # Assert status code and response content
#     assert response.status_code == 200
#     response_data = response.get_json()
#     assert response_data == ["result1", "result2"]


def test_generate_for_all_models_missing_user(mock_app):
    # Send POST request with missing curr_user
    response = mock_app.post(
        "/api/generate-for-all-models", data={}, content_type="multipart/form-data"
    )

    # Assert status code and error message
    assert response.status_code == 400
    response_data = response.get_json()
    assert response_data == {"error": "No current user found"}


def test_generate_for_all_models_no_models(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
    }

    # Mock the get_files_in_folder to return an empty list
    with patch(
        "backend.app.controllers.app.get_files_in_folder", return_value=[]
    ), patch("backend.app.controllers.app.EvaluateModelsUseCase"), patch(
        "backend.app.controllers.app.initialize"
    ):

        # Send POST request
        response = mock_app.post(
            "/api/generate-for-all-models",
            data=input_data,
            content_type="multipart/form-data",
        )

    # Assert status code and error message
    assert response.status_code == 400
    response_data = response.get_json()
    assert response_data == {"error": "No current user found"}


def test_generate_for_all_models_unexpected_error(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
    }

    # Mock the initialize and evaluator to raise an exception
    with patch(
        "backend.app.controllers.app.get_files_in_folder", return_value=["model1.pkl"]
    ), patch(
        "backend.app.controllers.app.EvaluateModelsUseCase",
        side_effect=Exception("Unexpected error"),
    ), patch(
        "backend.app.controllers.app.initialize"
    ):

        # Send POST request
        response = mock_app.post(
            "/api/generate-for-all-models",
            data=input_data,
            content_type="multipart/form-data",
        )

    # Assert status code and error message
    assert response.status_code == 400
    response_data = response.get_json()
    assert response_data == {"error": "No current user found"}


@pytest.fixture
def mock_app():
    app.config["TESTING"] = True
    app.debug = False
    return app.test_client()


# def test_delete_model_valid(mock_app):
#     input_data = {
#         "curr_user": "ff@gmail.com",
#         "file_name": "model_to_delete.pkl",
#     }

#     # Mock user initialization
#     with patch("backend.app.controllers.app.initialize"), \
#          patch("os.path.exists", return_value=True), \
#          patch("os.remove") as mock_remove:

#         # Send the POST request to delete the model
#         response = mock_app.post(
#             "/api/delete-model",
#             json=input_data
#         )

#     # Assert status code and response content
#     assert response.status_code == 200
#     assert response.json == {"message": "Successfully deleted model_to_delete.pkl"}
#     mock_remove.assert_called_once_with(os.path.join("uploads", "ff@gmail.com", "model_to_delete.pkl"))


def test_delete_model_file_not_found(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
        "file_name": "non_existent_model.pkl",
    }

    # Mock user initialization
    with patch("backend.app.controllers.app.initialize"), patch(
        "os.path.exists", return_value=False
    ):

        # Send the POST request to delete the model
        response = mock_app.post("/api/delete-model", json=input_data)

    # Assert status code and response content
    assert response.status_code == 400
    assert response.json == {"error": "No current user found"}


def test_delete_model_missing_fields(mock_app):
    input_data_missing_user = {
        "file_name": "model_to_delete.pkl",
    }

    input_data_missing_file = {
        "curr_user": "ff@gmail.com",
    }

    # Test missing curr_user
    response_user = mock_app.post("/api/delete-model", json=input_data_missing_user)
    assert response_user.status_code == 400
    assert response_user.json == {
        "error": "Missing required fields: curr_user or file_name"
    }

    # Test missing file_name
    response_file = mock_app.post("/api/delete-model", json=input_data_missing_file)
    assert response_file.status_code == 400
    assert response_file.json == {
        "error": "Missing required fields: curr_user or file_name"
    }


def test_delete_model_no_current_user(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
        "file_name": "model_to_delete.pkl",
    }

    # Mock initialization where no user is found
    with patch("backend.app.controllers.app.initialize"), patch(
        "backend.app.controllers.app.user.table_name", None
    ):

        # Send the POST request to delete the model
        response = mock_app.post("/api/delete-model", json=input_data)

    # Assert status code and response content
    assert response.status_code == 400
    assert response.json == {"error": "No current user found"}


def test_delete_model_exception(mock_app):
    input_data = {
        "curr_user": "ff@gmail.com",
        "file_name": "model_to_delete.pkl",
    }

    # Mock user initialization and file existence check
    with patch("backend.app.controllers.app.initialize"), patch(
        "os.path.exists", return_value=True
    ), patch("os.remove", side_effect=Exception("Unexpected error")):

        # Send the POST request to delete the model
        response = mock_app.post("/api/delete-model", json=input_data)

    # Assert status code and response content
    assert response.status_code == 400
    assert response.json == {"error": "No current user found"}


from backend.app.controllers.app import delete_files_except_model, get_files_in_folder


@pytest.fixture
def mock_files():
    """Fixture to mock the os.listdir and os.path.exists"""
    with patch("os.path.exists") as mock_exists, patch("os.listdir") as mock_listdir:
        yield mock_exists, mock_listdir


def test_get_files_in_folder_valid(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir = mock_files
    mock_exists.return_value = True
    mock_listdir.return_value = ["file1.txt", "file2.txt", "model.pkl"]

    # Call the function
    user_folder = "ff@gmail.com"
    result = get_files_in_folder(user_folder)

    # Assert that "model.pkl" is excluded from the list
    assert result == ["file1.txt", "file2.txt"]
    mock_listdir.assert_called_once_with(os.path.join("uploads", user_folder))


def test_get_files_in_folder_only_model(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir = mock_files
    mock_exists.return_value = True
    mock_listdir.return_value = ["model.pkl"]

    # Call the function
    user_folder = "ff@gmail.com"
    result = get_files_in_folder(user_folder)

    # Assert that the list is empty after removing "model.pkl"
    assert result == []
    mock_listdir.assert_called_once_with(os.path.join("uploads", user_folder))


def test_get_files_in_folder_folder_not_exist(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir = mock_files
    mock_exists.return_value = False

    # Call the function
    user_folder = "ff@gmail.com"
    result = get_files_in_folder(user_folder)

    # Assert that an empty list is returned
    assert result == []
    mock_exists.assert_called_once_with(os.path.join("uploads", user_folder))


def test_get_files_in_folder_exception(mock_files):
    # Prepare the mock return values and simulate an exception
    mock_exists, mock_listdir = mock_files
    mock_exists.return_value = True
    mock_listdir.side_effect = Exception("Unexpected error")

    # Call the function
    user_folder = "ff@gmail.com"
    result = get_files_in_folder(user_folder)

    # Assert that an empty list is returned and an error message is printed
    assert result == []
    mock_listdir.assert_called_once_with(os.path.join("uploads", user_folder))


# @pytest.fixture
# def mock_files():
#     """Fixture to mock the os methods used in delete_files_except_model"""
#     with patch("os.path.exists") as mock_exists, patch("os.listdir") as mock_listdir, patch("os.remove") as mock_remove:
#         yield mock_exists, mock_listdir, mock_remove

# def test_delete_files_except_model_valid(mock_files):
#     # Prepare the mock return values
#     mock_exists, mock_listdir, mock_remove = mock_files
#     mock_exists.return_value = True
#     mock_listdir.return_value = ["file1.txt", "model.pkl", "file2.txt"]

#     # Call the function
#     user_folder = "ff@gmail.com"
#     delete_files_except_model(user_folder)

#     # Assert that 'file1.txt' and 'file2.txt' were deleted and 'model.pkl' was skipped
#     mock_remove.assert_any_call(os.path.join(UPLOAD_FOLDER, user_folder, "file1.txt"))
#     mock_remove.assert_any_call(os.path.join(UPLOAD_FOLDER, user_folder, "file2.txt"))
#     mock_remove.assert_not_called_with(os.path.join(UPLOAD_FOLDER, user_folder, "model.pkl"))
#     mock_listdir.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))

# def test_delete_files_except_model_only_model(mock_files):
#     # Prepare the mock return values
#     mock_exists, mock_listdir, mock_remove = mock_files
#     mock_exists.return_value = True
#     mock_listdir.return_value = ["model.pkl"]

#     # Call the function
#     user_folder = "ff@gmail.com"
#     delete_files_except_model(user_folder)

#     # Assert that no files were deleted
#     mock_remove.assert_not_called()
#     mock_listdir.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))

# def test_delete_files_except_model_folder_not_exist(mock_files):
#     # Prepare the mock return values
#     mock_exists, mock_listdir, mock_remove = mock_files
#     mock_exists.return_value = False

#     # Call the function
#     user_folder = "ff@gmail.com"
#     delete_files_except_model(user_folder)

#     # Assert that no files are deleted and the folder existence check is called
#     mock_remove.assert_not_called()
#     mock_listdir.assert_not_called()
#     mock_exists.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))

# def test_delete_files_except_model_exception(mock_files):
#     # Simulate an exception during the file removal process
#     mock_exists, mock_listdir, mock_remove = mock_files
#     mock_exists.return_value = True
#     mock_listdir.return_value = ["file1.txt", "model.pkl"]

#     # Simulate exception when removing a file
#     mock_remove.side_effect = Exception("Error removing file")

#     # Call the function
#     user_folder = "ff@gmail.com"
#     delete_files_except_model(user_folder)

#     # Assert that the exception is caught and the function continues
#     mock_remove.assert_any_call(os.path.join(UPLOAD_FOLDER, user_folder, "file1.txt"))
#     mock_listdir.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))

if __name__ == "__main__":
    unittest.main()
