import os
import pytest
from io import BytesIO
from app.controllers.app import app  # Adjust this import based on your project structure

# Create a temporary directory for uploads
UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to create a fake file for testing
def create_fake_file(filename="model.pkl", content=b"fake model content"):
    return BytesIO(content)

# Test cases for upload_model
@pytest.fixture
def client():
    # Set up a test client
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    with app.test_client() as client:
        yield client

def test_upload_model_missing_data(client):
    """Test for missing 'curr_user' or 'model_file'"""
    # Missing 'model_file'
    response = client.post('/api/upload-model', data={'curr_user': 'test_user'})
    assert response.status_code == 400
    assert b"Missing required data." in response.data

    # Missing 'curr_user'
    data = {
        'model_file': create_fake_file(),
        'dashboard': 'secret_token',
    }
    response = client.post('/api/upload-model', data=data)
    assert response.status_code == 400
    assert b"Missing required data." in response.data

def test_upload_model_invalid_file_format(client):
    """Test for an invalid file format (non-pkl file)"""
    data = {
        'model_file': (create_fake_file(filename="model.txt"), "model.txt"),
        'curr_user': 'test_user',
        'dashboard': 'secret_token',
    }
    response = client.post('/api/upload-model', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    assert b"Invalid file format." in response.data

def test_upload_model_success(client):
    """Test for successful model upload"""
    data = {
        'model_file': (create_fake_file(filename="model.pkl"), "model.pkl"),
        'curr_user': 'test_user',
        'dashboard': 'secret_token',
    }
    response = client.post('/api/upload-model', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    assert b"Model uploaded successfully." in response.data

    # Verify if the file is saved in the correct location
    user_folder = os.path.join(UPLOAD_FOLDER, 'test_user')
    file_path = os.path.join(user_folder, 'model.pkl')
    assert os.path.exists(file_path)

    # Clean up after test
    if os.path.exists(file_path):
        os.remove(file_path)

def test_upload_model_with_custom_filename(client):
    """Test for uploading model with a custom filename"""
    data = {
        'model_file': (create_fake_file(filename="custom_model.pkl"), "custom_model.pkl"),
        'curr_user': 'test_user',
        'dashboard': 'custom_dashboard',
    }
    response = client.post('/api/upload-model', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    assert b"Model uploaded successfully." in response.data

    # Verify the custom filename is used
    user_folder = os.path.join(UPLOAD_FOLDER, 'test_user')
    file_path = os.path.join(user_folder, 'custom_dashboard')
    assert os.path.exists(file_path)

    # Clean up after test
    if os.path.exists(file_path):
        os.remove(file_path)

def test_upload_model_with_secret_token(client):
    """Test for uploading model using 'secret_token' as the dashboard"""
    data = {
        'model_file': (create_fake_file(filename="model.pkl"), "model.pkl"),
        'curr_user': 'test_user',
        'dashboard': 'secret_token',
    }
    response = client.post('/api/upload-model', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    assert b"Model uploaded successfully." in response.data

    # Verify the fixed filename 'model.pkl' is used
    user_folder = os.path.join(UPLOAD_FOLDER, 'test_user')
    file_path = os.path.join(user_folder, 'model.pkl')
    assert os.path.exists(file_path)

    # Clean up after test
    if os.path.exists(file_path):
        os.remove(file_path)
