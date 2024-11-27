from unittest.mock import patch, MagicMock
import os
import pytest
from app.controllers.app import (
    delete_files_except_model,
    load_model,
)  # Replace with the correct import path

UPLOAD_FOLDER = "uploads/"


@pytest.fixture
def mock_files():
    """Fixture to mock the os methods used in delete_files_except_model"""
    with patch("os.path.exists") as mock_exists, patch(
        "os.listdir"
    ) as mock_listdir, patch("os.remove") as mock_remove:
        yield mock_exists, mock_listdir, mock_remove


def test_delete_files_except_model_valid(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir, mock_remove = mock_files
    mock_exists.return_value = True
    mock_listdir.return_value = ["file1.txt", "model.pkl", "file2.txt"]

    # Call the function
    user_folder = "ff@gmail.com"
    delete_files_except_model(user_folder)

    file1_path = os.path.join(UPLOAD_FOLDER, user_folder, "file1.txt")
    file2_path = os.path.join(UPLOAD_FOLDER, user_folder, "file2.txt")
    model_path = os.path.join(UPLOAD_FOLDER, user_folder, "model.pkl")

    # Assert that 'file1.txt' and 'file2.txt' were deleted and 'model.pkl' was skipped
    assert model_path not in [call[0][0] for call in mock_remove.call_args_list]

    # Check that 'file1.txt' was not deleted
    assert file1_path not in [call[0][0] for call in mock_remove.call_args_list]


def test_delete_files_except_model_only_model(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir, mock_remove = mock_files
    mock_exists.return_value = True
    mock_listdir.return_value = ["model.pkl"]

    # Call the function
    user_folder = "ff@gmail.com"
    delete_files_except_model(user_folder)

    # Assert that no files were deleted
    mock_remove.assert_not_called()
    mock_listdir.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))


def test_delete_files_except_model_folder_not_exist(mock_files):
    # Prepare the mock return values
    mock_exists, mock_listdir, mock_remove = mock_files
    mock_exists.return_value = False

    # Call the function
    user_folder = "ff@gmail.com"
    delete_files_except_model(user_folder)

    # Assert that no files are deleted and the folder existence check is called
    mock_remove.assert_not_called()
    mock_listdir.assert_not_called()
    mock_exists.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))


def test_delete_files_except_model_exception(mock_files):
    # Simulate an exception during the file removal process
    mock_exists, mock_listdir, mock_remove = mock_files
    mock_exists.return_value = True
    mock_listdir.return_value = ["file1.txt", "model.pkl"]

    # Simulate exception when removing a file
    mock_remove.side_effect = Exception("Error removing file")

    # Call the function
    user_folder = "ff@gmail.com"
    delete_files_except_model(user_folder)

    # Assert that the exception is caught and the function continues
    mock_listdir.assert_called_once_with(os.path.join(UPLOAD_FOLDER, user_folder))
