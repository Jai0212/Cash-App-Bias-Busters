from typing import Tuple
import os
import pandas as pd
import numpy as np


class FileReader:
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
        df = pd.read_csv(self.csv_file_path)
        df_cleaned = df.drop(["timestamp", "id"], axis=1, errors="ignore")

        if df_cleaned.shape[1] == 2:  # Check if the DataFrame has only one column after dropping
            self.single_column_check = True

        df_dropped = self._age_check(df_cleaned)
        inputs = self._get_inputs(df_dropped)
        target = self._get_target(df_dropped)

        return df_dropped, inputs, target

    def _get_target(self, df: pd.DataFrame) -> pd.Series:
        """
        Returns the target column 'action_status' from the dataframe, if exists.
        """
        return df.get("action_status", pd.Series())  # Get 'action_status' or an empty Series if it does not exist

    def _get_inputs(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Returns the input columns by dropping the 'action_status' column, if it exists.
        """
        return df.drop("action_status", axis="columns", errors="ignore")

    def _age_check(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Checks if the 'age' column exists in the dataframe, and if so, bins it
        into age groups and removes the original 'age' column.
        """
        if "age" in df.columns:
            bins = range(18, 90, 9)
            labels = [f"{i}-{i + 8}" for i in bins[:-1]]
            df["age_groups"] = pd.cut(df["age"], bins=bins, labels=labels, right=False)

        return df.drop("age", axis=1, errors="ignore")

