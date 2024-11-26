# import os
# import pytest
# from app.controllers.app import app
# from unittest.mock import patch, MagicMock
# import unittest

# # Test Configuration
# UPLOAD_FOLDER = '/mock/uploads'

# @pytest.fixture
# def client():
#     # This fixture sets up the Flask test client and mock configurations
#     app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
#     app.config['SECRET_KEY'] = 'secret'
#     with app.test_client() as client:
#         yield client


# # Mocking the required functions to avoid actual file interaction
# def mock_initialize(curr_user):
#     return

# def mock_get_files_in_folder(curr_user):
#     return ['model1.csv', 'model2.csv']  # Mocked file names

# def mock_execute_evaluation(models):
#     # This simulates the behavior of EvaluateModelsUseCase
#     return {"model1": "output1", "model2": "output2"}

# # Mocking the repository and use case
# def mock_CsvFileRepo(User, file_path):
#     return "Mocked Repo"

# def mock_EvaluateModelsUseCase(new_file_repo, models):
#     return mock_execute_evaluation(models)


# # Test Case 1: Test for Successful Request with Correct User
# def test_generate_for_all_models_success(client, mocker):
#     # Mock the functions that interact with file system and evaluation
#     mocker.patch('app.controllers.app.initialize', side_effect=mock_initialize)
#     mocker.patch('app.controllers.app.get_files_in_folder', side_effect=mock_get_files_in_folder)
#     mocker.patch('app.controllers.app.CsvFileRepo', side_effect=mock_CsvFileRepo)
#     mocker.patch('app.controllers.app.EvaluateModelsUseCase', side_effect=mock_EvaluateModelsUseCase)

#     # Sending POST request with curr_user form data
#     response = client.post('/api/generate-for-all-models', data={'curr_user': 'test_user'})

#     # Verifying the response
#     assert response.status_code == 200
#     assert b"output1" in response.data
#     assert b"output2" in response.data


# # Test Case 2: Test for Missing curr_user
# def test_generate_for_all_models_missing_user(client, mocker):
#     # Sending POST request without curr_user form data
#     response = client.post('/api/generate-for-all-models', data={})

#     # Verifying the error response
#     assert response.status_code == 400
#     assert b"No current user found" in response.data


# # Test Case 3: Test for Internal Server Error (Unexpected Error)
# def test_generate_for_all_models_server_error(client, mocker):
#     # Mocking the functions to raise an error
#     mocker.patch('app.controllers.app.initialize', side_effect=Exception("Some unexpected error"))
    
#     # Sending POST request with curr_user form data
#     response = client.post('/api/generate-for-all-models', data={'curr_user': 'test_user'})

#     # Verifying the error response
#     assert response.status_code == 500
#     assert b"Some unexpected error" in response.data


# # Test Case 4: Test for File Path Handling (Optional)
# def test_generate_for_all_models_file_path(client, mocker):
#     # Mock the necessary function
#     mocker.patch('app.controllers.app.get_files_in_folder', side_effect=mock_get_files_in_folder)
#     mocker.patch('app.controllers.app.EvaluateModelsUseCase', side_effect=mock_EvaluateModelsUseCase)

#     # Test if file paths are correctly constructed
#     with mocker.patch('os.path.join', return_value=f"{UPLOAD_FOLDER}/test_user/model1.csv") as mock_join:
#         response = client.post('/api/generate-for-all-models', data={'curr_user': 'test_user'})
#         assert response.status_code == 200
#         mock_join.assert_called_with(UPLOAD_FOLDER, 'test_user', 'model1.csv')


# # Test Case 5: Test for Missing Files in Folder
# def test_generate_for_all_models_no_files(client, mocker):
#     # Mock the get_files_in_folder to return an empty list
#     mocker.patch('app.controllers.app.get_files_in_folder', return_value=[])

#     # Sending POST request with curr_user form data
#     response = client.post('/api/generate-for-all-models', data={'curr_user': 'test_user'})

#     # Verifying the error response
#     assert response.status_code == 400
#     assert b"No files found for the user" in response.data
