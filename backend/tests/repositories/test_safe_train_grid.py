from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest
from ml_model.repository.safe_train_grid import (
    safe_grid_search,
)  # Adjust import based on your project structure
from ml_model.repository.safe_train_grid import safe_train_test_split
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.tree import DecisionTreeClassifier


# Test safe_train_test_split
def test_safe_train_test_split_insufficient_samples():
    """Test for safe_train_test_split with insufficient samples."""
    # Create a small dataset with less than 2 samples (for example)
    inputs = pd.DataFrame({"feature1": [1]})
    target = pd.Series([0])

    result = safe_train_test_split(inputs, target)
    assert result is None, "Expected None when there aren't enough samples to split."


def test_safe_train_test_split_valid_case():
    """Test for safe_train_test_split with sufficient samples."""
    # Create a dataset with more than 2 samples
    inputs = pd.DataFrame({"feature1": [1, 2, 3, 4, 5]})
    target = pd.Series([0, 1, 0, 1, 0])

    result = safe_train_test_split(inputs, target)
    assert result is not None, "Expected valid result with enough samples."
    assert (
        len(result) == 4
    ), "Expected the result to return four elements (x_train, x_test, y_train, y_test)."


# Test safe_grid_search
def test_safe_grid_search_insufficient_samples():
    """Test for safe_grid_search with insufficient samples for cross-validation."""
    # Create a small dataset with less than 5 samples
    x_train = pd.DataFrame({"feature1": [1, 2]})
    y_train = pd.Series([0, 1])

    result = safe_grid_search(x_train, y_train)
    assert (
        result is None
    ), "Expected None when there aren't enough samples for cross-validation."
