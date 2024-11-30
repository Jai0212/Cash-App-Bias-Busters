import os
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest
from backend.ml_model.repository.model_saver import save_model
from sklearn.model_selection import GridSearchCV


@pytest.fixture
def mock_model_and_data():
    """Fixture to provide a mock GridSearchCV model and dummy data."""
    # Create a mock GridSearchCV object
    mock_clf = MagicMock(spec=GridSearchCV)
    mock_clf.score.return_value = (
        0.85  # Mock the score function to return a fixed score
    )

    # Dummy data
    x_test = pd.DataFrame({"feature1": [1, 2, 3], "feature2": [4, 5, 6]})
    y_test = pd.Series([0, 1, 0])

    return mock_clf, x_test, y_test


@patch("builtins.open", new_callable=MagicMock)  # Mock open() to simulate file creation
@patch(
    "pickle.dump", new_callable=MagicMock
)  # Mock pickle.dump to avoid actual pickling
def test_save_model(mock_pickle_dump, mock_open, mock_model_and_data):
    """Test the save_model function to ensure it returns None."""
    mock_clf, x_test, y_test = mock_model_and_data

    # Call the save_model function
    result = save_model(mock_clf, x_test, y_test)

    # Check that the function returns None
    assert (
        result is None
    ), "Expected save_model to return None, but it returned something else."
