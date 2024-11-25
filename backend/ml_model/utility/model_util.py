"""This file will hold the helper functions for the ml-model folder"""

from typing import Tuple
import os
import pandas as pd
import numpy as np


def get_target(df: pd.DataFrame) -> pd.Series:
    """
    Returns the target column 'action_status' from the dataframe, if exists.
    """
    return df.get("action_status", pd.Series())  # Get 'action_status' or an empty Series if it does not exist


def get_inputs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns the input columns by dropping the 'action_status' column, if it exists.
    """
    return df.drop("action_status", axis="columns", errors="ignore")


def age_check(df: pd.DataFrame) -> pd.DataFrame:
    """
    Checks if the 'age' column exists in the dataframe, and if so, bins it
    into age groups and removes the original 'age' column.
    """
    if "age" in df.columns:
        bins = range(18, 90, 9)
        labels = [f"{i}-{i + 8}" for i in bins[:-1]]
        df["age_groups"] = pd.cut(df["age"], bins=bins, labels=labels, right=False)

    return df.drop("age", axis=1, errors="ignore")
