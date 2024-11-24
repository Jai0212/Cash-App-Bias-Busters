import pytest
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from ml_model.repository.data_preprocessing import (
    DataProcessor,
)

# Sample data for testing
data = {
    "gender": ["Male", "Female", "Female", "Male"],
    "age_groups": ["18-25", "26-35", "18-25", "36-45"],
    "race": ["White", "Black", "Asian", "White"],
    "state": ["CA", "NY", "TX", "CA"],
    "income": [50000, 60000, 45000, 70000],  # Non-categorical column
}
inputs = pd.DataFrame(data)


@pytest.fixture
def data_processor():
    return DataProcessor(inputs.copy())


def test_encode_categorical_columns(data_processor):
    processed_df = data_processor.encode_categorical_columns()

    # Check if new columns are added
    for col in data_processor.categorical_columns:
        assert f"{col}_N" in processed_df.columns

    # Verify that the encoded columns contain integers
    for col in data_processor.categorical_columns:
        assert pd.api.types.is_integer_dtype(processed_df[f"{col}_N"]) is True

    # Ensure LabelEncoders are stored
    assert len(data_processor.le_dict) == len(data_processor.categorical_columns)


def test_get_mappings(data_processor):
    data_processor.encode_categorical_columns()
    mappings = data_processor.get_mappings()

    # Check that mappings are created for all categorical columns
    assert len(mappings) == len(data_processor.categorical_columns)

    # Verify mappings for one column (e.g., 'gender')
    if "gender" in data_processor.le_dict:
        le = data_processor.le_dict["gender"]
        expected_mapping = dict(zip(le.transform(le.classes_), le.classes_))
        assert mappings["gender"] == expected_mapping


def test_drop_categorical_columns(data_processor):
    data_processor.encode_categorical_columns()
    updated_df = data_processor.drop_categorical_columns()

    # Check that original categorical columns are removed
    for col in data_processor.categorical_columns:
        assert col not in updated_df.columns

    # Ensure encoded columns are still present
    for col in data_processor.categorical_columns:
        assert f"{col}_N" in updated_df.columns


def test_combined_functionality(data_processor):
    processed_df = data_processor.encode_categorical_columns()

    mappings = data_processor.get_mappings()

    updated_df = data_processor.drop_categorical_columns()

    # Verify that processed_df has both original and encoded columns
    for col in data_processor.categorical_columns:
        assert col in processed_df.columns
        assert f"{col}_N" in processed_df.columns

    # Verify mappings
    for col in data_processor.categorical_columns:
        le = data_processor.le_dict[col]
        expected_mapping = dict(zip(le.transform(le.classes_), le.classes_))
        assert mappings[col] == expected_mapping

    # Verify updated_df only has encoded columns
    for col in data_processor.categorical_columns:
        assert col not in updated_df.columns
        assert f"{col}_N" in updated_df.columns
