import os
import sys
from typing import Tuple

import numpy as np
import pandas as pd

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

from utility import model_util

from backend.ml_model.use_cases.FileReaderInterface import FileReaderInterface


class FileReaderMultiple(FileReaderInterface):
    """
    A utility class for reading and preprocessing multiple CSV files for machine learning purposes.

    The class initializes with the path to a CSV file and processes it to:
    - Drop unnecessary columns like `timestamp` and `id`.
    - Bin the `age` column into groups (if present).
    - Separate the dataframe into inputs and the target column (`action_status`).
    """

    def __init__(self, csv_file_path: str):
        """
        Initialize the FileReader class with file path and categorical columns.

        :param csv_file_path: Path to the CSV file.
        """
        self.csv_file_path = csv_file_path
        self.categorical_columns = ["gender", "age_groups", "race", "state"]
        self.single_column_check = False

    def read_file(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
        """
        Reads the CSV file, processes it, and returns the cleaned dataframe,
        inputs, and target action_status.
        """
        # Read the CSV file into a dataframe
        df = pd.read_csv(self.csv_file_path)

        # Drop any columns that are not needed, e.g., 'customer_id', 'zip_code', etc.
        columns_to_drop = [
            "customer_id",
            "zip_code",
            "timestamp",
            "id",
        ]  # Add any other columns you don't need
        df_cleaned = df.drop(columns=columns_to_drop, axis=1, errors="ignore")

        # Check if the dataframe has only one column after dropping
        if df_cleaned.shape[1] == 2:  # If the DataFrame has only two columns left
            self.single_column_check = True

        # Process the age column to age groups if it exists
        df_dropped = model_util.age_check(df_cleaned)

        # Get the input features and target variable
        inputs = model_util.get_inputs(df_dropped)
        target = model_util.get_target(df_dropped)

        return df_dropped, inputs, target
