# tests/entities/test_user.py

import pytest
from app.entities.user import User  # Adjust the import according to your project structure

def test_user_initialization():
    user_email = "test@example.com"
    user = User(user_email)
    assert user.table_name == user_email, "User table_name should be set to user_email"

def test_user_with_empty_email():
    user = User("")
    assert user.table_name == "", "User table_name should handle empty email string"

def test_user_with_none_email():
    user = User(None)
    assert user.table_name is None, "User table_name should handle None as email"
