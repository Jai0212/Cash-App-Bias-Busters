from io import StringIO
from unittest.mock import patch

import pandas as pd
import pytest
from ml_model.repository.file_reader_multiple_models import FileReaderMultiple
from ml_model.utility import model_util


# Mocked CSV data for testing
@pytest.fixture
def mock_csv_data():
    csv_data = """
    customer_id,gender,age,race,state,zip_code,timestamp,action_status
    1,male,25,asian,NY,12345,2021-01-01,1
    2,female,30,black,CA,67890,2021-02-01,0
    3,female,35,white,TX,11223,2021-03-01,1
    4,male,40,asian,FL,33445,2021-04-01,0
    """
    return StringIO(csv_data)


# Test reading and processing of CSV file
def test_read_file(mock_csv_data):
    # Patch pandas read_csv to return the mock CSV data instead of reading from an actual file
    with patch("pandas.read_csv", return_value=pd.read_csv(mock_csv_data)):
        reader = FileReaderMultiple("mock_file.csv")

        # Calling the method to read and process the file
        df_dropped, inputs, target = reader.read_file()

        # Check if unnecessary columns were dropped
        assert "customer_id" not in df_dropped.columns
        assert "zip_code" not in df_dropped.columns
        assert "timestamp" not in df_dropped.columns
        assert "id" not in df_dropped.columns

        # Check if the age column was binned correctly
        assert (
            "age_groups" in df_dropped.columns
        )  # Age should be binned into age_groups

        # Check if inputs and target were correctly extracted
        assert isinstance(inputs, pd.DataFrame)
        assert isinstance(target, pd.Series)


# Test when there are only two columns in the CSV
def test_single_column_check(mock_csv_data):
    csv_data = """
    customer_id,action_status
    1,1
    2,0
    """
    # Mock CSV data with only two columns: 'customer_id' and 'action_status'
    with patch("pandas.read_csv", return_value=pd.read_csv(StringIO(csv_data))):
        reader = FileReaderMultiple("mock_file.csv")

        # Calling the method to read and process the file
        df_dropped, inputs, target = reader.read_file()

        # Check if single_column_check was set to True
        assert (
            reader.single_column_check is True
        )  # Only two columns left, so single_column_check should be True

        # Ensure the DataFrame is properly cleaned (only 'action_status' left)
        assert "customer_id" not in df_dropped.columns
        assert "action_status" in df_dropped.columns


@patch.object(
    model_util,
    "age_check",
    return_value=pd.DataFrame(
        {
            "gender": ["male", "female"],
            "age_groups": [
                "18-26",
                "27-35",
            ],  # Update this to reflect the correct binning
            "race": ["asian", "black"],
            "state": ["NY", "CA"],
            "action_status": [1, 0],
        }
    ),
)
def test_age_bin(mock_age_check):
    csv_data = """
    customer_id,gender,age,race,state,zip_code,timestamp,action_status
    1,male,25,asian,NY,12345,2021-01-01,1
    2,female,30,black,CA,67890,2021-02-01,0
    """
    # Mock CSV data to simulate reading and preprocessing
    with patch("pandas.read_csv", return_value=pd.read_csv(StringIO(csv_data))):
        reader = FileReaderMultiple("mock_file.csv")

        # Calling the method to read and process the file
        df_dropped, inputs, target = reader.read_file()

        # Verify that the 'age_groups' column was added
        assert "age_groups" in df_dropped.columns
        assert df_dropped["age_groups"].iloc[0] == "18-26"


def test_output_structure(mock_csv_data):
    with patch("pandas.read_csv", return_value=pd.read_csv(mock_csv_data)):
        reader = FileReaderMultiple("mock_file.csv")

        # Calling the method to read and process the file
        df_dropped, inputs, target = reader.read_file()

        # Check if the returned values have the expected structure
        assert isinstance(df_dropped, pd.DataFrame)  # The cleaned DataFrame
        assert isinstance(inputs, pd.DataFrame)  # The input features DataFrame
        assert isinstance(target, pd.Series)  # The target column (action_status)
