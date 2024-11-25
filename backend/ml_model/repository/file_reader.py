from typing import Tuple
import pandas as pd
import numpy as np
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from interfaces.file_reader_interface import FileReaderInterface


class FileReader(FileReaderInterface):
    """
        A utility class for reading and preprocessing a CSV file for machine learning purposes.

        The class initializes with the path to a CSV file and processes it to:
        - Drop unnecessary columns like `timestamp` and `id`.
        - Bin the `age` column into groups (if present).
        - Separate the dataframe into inputs and the target column (`action_status`).
    """

    def __init__(self, csv_file_path: str):
        """
        Initialize the FileReader class with file path and categorical columns.

        :param csv_file_path: Path to the CSV file.
        :param categorical_columns: List of categorical columns.
        """
        self.csv_file_path = csv_file_path
        self.categorical_columns = ["gender", "age_groups", "race", "state"]
        self.single_column_check = False

    def read_file(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
        """
        Reads the CSV file, processes it, and returns the cleaned dataframe,
        inputs, and target action_status.
        """

        from utility import model_util

        df = pd.read_csv(self.csv_file_path)
        df_cleaned = df.drop(["timestamp", "id"], axis=1, errors="ignore")

        if df_cleaned.shape[1] == 2:  # Check if the DataFrame has only one column after dropping
            self.single_column_check = True

        df_dropped = model_util.age_check(df_cleaned)
        inputs = model_util.get_inputs(df_dropped)
        target = model_util.get_target(df_dropped)

        return df_dropped, inputs, target
