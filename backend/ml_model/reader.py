from typing import Tuple
import os
import pandas as pd

single_column_check = False
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "../../database/output.csv")


def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series):  # type: ignore
    """
    This function will read the csv file.
    Then it will check whether there is only one column in the cleaned file
    after dropping timestamp and id.
    If age is one of these columns it will have to create bins based on age
    groups incremented by 9.
    Then our target is action_status, and it returns the cleaned file, inputs and
    action_status.
    """

    df = pd.read_csv(csv_file_path)
    df_cleaned = df.drop(["timestamp", "id"], axis=1, errors="ignore")

    if df_cleaned.shape[1] == 2:        # Check if the DataFrame has only one column
        self.single_column_check = True

    df_dropped = age_check(df_cleaned)
    inputs = get_inputs(df_dropped)
    target = get_target(df_dropped)

    return df_dropped, inputs, target


def get_target(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns the target of the dataframe on the parameter.
    """
    return df.get("action_status", pd.Series())  # Get 'action_status' or an empty Series if it does not exist


def get_inputs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns the inputs of the dataframe on the parameter.
    """
    # Ignore error if 'action_status' does not exist
    return df.drop("action_status", axis="columns", errors="ignore")


def age_check(df: pd.DataFrame) -> pd.DataFrame:
    """
    This function will check if the data frame entered has a age column, then convets it into age_groups where
    the age groups are put into bins.
    """
    if "age" in df.columns:     # Check if 'age' column exists

        bins = range(18, 90, 9)
        labels = [f"{i}-{i + 8}" for i in bins[:-1]]         # Create labels for each bin

        df["age_groups"] = pd.cut(
            df["age"], bins=bins, labels=labels, right=False        # Use cut to create a new column with age groups
        )
    return df.drop("age", axis=1, errors="ignore")
