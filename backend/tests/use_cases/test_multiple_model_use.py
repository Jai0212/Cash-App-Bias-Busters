from unittest.mock import MagicMock, patch

import pytest
from backend.ml_model.repository.multiple_models import evaluate_multiple_models
from backend.ml_model.use_cases.multiple_model_use import EvaluateModelsUseCase


@pytest.fixture
def mock_file_repo():
    """Fixture to mock the FileRepository."""
    mock_repo = MagicMock()
    return mock_repo


@pytest.fixture
def mock_model_files():
    """Fixture to mock model files."""
    return ["model1.pkl", "model2.pkl"]


@patch("ml_model.repository.multiple_models.evaluate_multiple_models")
def test_execute_with_failure(
    mock_evaluate_multiple_models, mock_file_repo, mock_model_files
):
    """Test the execute method handling a failure scenario."""

    # Simulate an error in the evaluate_multiple_models function
    mock_evaluate_multiple_models.side_effect = Exception("Evaluation failed")

    # Initialize the use case
    use_case = EvaluateModelsUseCase(
        file_repo=mock_file_repo, model_files=mock_model_files
    )

    # Assert that the exception is properly raised
    with pytest.raises(Exception):
        use_case.execute()

    # Ensure that FileRepository methods were still called
    mock_file_repo.save_data_to_csv.assert_called_once()
