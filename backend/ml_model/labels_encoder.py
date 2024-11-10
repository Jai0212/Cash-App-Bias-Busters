from typing import Dict, Tuple
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from reader import file_reader


categorical_columns = ["gender", "age_groups", "race", "state"]


def labels_encoder():
    """
    Orchestrates label encoding and returns encoded data along with mappings.
    """
    _, inputs, _ = file_reader()
    le_dict = {}
    inputs = encode_categorical_columns(inputs, le_dict)
    mappings = get_mappings(le_dict)
    inputs_n = drop_categorical_columns(inputs)
    return inputs_n, mappings


def encode_categorical_columns(inputs: pd.DataFrame, le_dict: dict) -> pd.DataFrame:
    """
    Encodes each categorical column using LabelEncoder.
    """
    for col in categorical_columns:
        if col in inputs.columns:
            le = LabelEncoder()
            inputs[f"{col}_N"] = le.fit_transform(inputs[col])
            le_dict[col] = le
    return inputs


def get_mappings(le_dict: dict) -> dict:
    """
    Retrieves mappings from encoded values to original labels.
    """
    return {
        col: dict(zip(le.transform(le.classes_), le.classes_))
        for col, le in le_dict.items()
    }


def drop_categorical_columns(inputs: pd.DataFrame) -> pd.DataFrame:
    """
    Drops the original categorical columns and returns necessary columns.
    """
    return inputs.drop(columns=categorical_columns, errors="ignore")
