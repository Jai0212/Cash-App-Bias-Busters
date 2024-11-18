import os
import sys
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

from ml_model.repository.multiple_models import evaluate_multiple_models


class EvaluateModelsUseCase:
    """
    Use case class for evaluating multiple models for fairness.
    """

    def __init__(self, model_files):
        """
        Initializes the use case with the model files and dataset path.

        Args:
            model_files (list): List of file paths to the serialized model (.pkl) files.
            csv_file_path (str): Path to the dataset CSV file.
        """
        self.model_files = model_files

    def execute(self):
        """
        Executes the evaluation logic using the repository function.

        Returns:
            dict: A dictionary containing model file names and their respective MetricFrame objects.
        """
        return evaluate_multiple_models(self.model_files)
