import pytest
import pandas as pd
from ml_model.repository.data_preprocessing_multiple_models import DataProcessorMultiple


# Test Data for mocking
@pytest.fixture
def mock_data():
    # Creating a simple DataFrame to mock input data
    return pd.DataFrame({
        "gender": ["male", "female", "female", "male"],
        "age_groups": ["young", "middle", "old", "middle"],
        "race": ["asian", "black", "white", "asian"],
        "state": ["NY", "CA", "TX", "FL"]
    })


# Test for encoding categorical columns
def test_encode_categorical_columns(mock_data):
    processor = DataProcessorMultiple(mock_data)
    encoded_df = processor.encode_categorical_columns()

    # Check that the DataFrame has new encoded columns
    assert "gender_N" in encoded_df.columns
    assert "age_groups_N" in encoded_df.columns
    assert "race_N" in encoded_df.columns
    assert "state_N" in encoded_df.columns

    # Check that the encoding applied to 'gender' column is correct
    assert encoded_df["gender_N"].iloc[0] in [0, 1]  # encoded values should be integers
    assert encoded_df["age_groups_N"].iloc[0] in [0, 1, 2]  # encoded values should be integers


# Test for getting mappings from categorical columns
def test_get_mappings(mock_data):
    processor = DataProcessorMultiple(mock_data)
    processor.encode_categorical_columns()  # Ensure that encoding has happened
    mappings = processor.get_mappings()

    # Check that the mappings dictionary has the correct keys (column names)
    assert "gender" in mappings
    assert "age_groups" in mappings
    assert "race" in mappings
    assert "state" in mappings

    # Check if mappings are correct
    assert isinstance(mappings["gender"], dict)
    assert all(isinstance(value, str) for value in mappings["gender"].values())  # The mapped values should be strings


# Test for dropping the original categorical columns
def test_drop_categorical_columns(mock_data):
    processor = DataProcessorMultiple(mock_data)
    processor.encode_categorical_columns()  # Ensure that encoding has happened
    df_after_drop = processor.drop_categorical_columns()

    # Check that the original categorical columns have been dropped
    assert "gender" not in df_after_drop.columns
    assert "age_groups" not in df_after_drop.columns
    assert "race" not in df_after_drop.columns
    assert "state" not in df_after_drop.columns

    # Ensure that the encoded columns still exist
    assert "gender_N" in df_after_drop.columns
    assert "age_groups_N" in df_after_drop.columns
    assert "race_N" in df_after_drop.columns
    assert "state_N" in df_after_drop.columns
