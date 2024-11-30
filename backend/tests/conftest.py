# conftest.py
import os

import pytest

from backend.app.entities import User
from backend.app.repositories import CsvFileRepo, SqliteDbRepo


@pytest.fixture
def user_fixture():
    return User("ff@gmail.com")


@pytest.fixture
def file_path_fixture():
    curr_dir = os.path.dirname(__file__)
    return os.path.join(curr_dir, "../../database/output.csv")


@pytest.fixture
def mock_file_repo(user_fixture, file_path_fixture):
    return CsvFileRepo(user_fixture, file_path_fixture)


@pytest.fixture
def mock_db_repo(user_fixture):
    return SqliteDbRepo(user_fixture)
