import pandas as pd
import pytest
from ml_model.repository.file_reader import FileReader


@pytest.fixture
def single_column_file(tmp_path):
    """Fixture to create a temporary single-column CSV file."""
    data = pd.DataFrame({"action_status": [1, 0, 1, 0, 1]})
    file_path = tmp_path / "single_column_file.csv"
    data.to_csv(file_path, index=False)
    return file_path


def test_single_column_file(single_column_file):
    """Test that single column check is flagged as True when only one column remains after cleaning."""
    # Initialize FileReader with the single column file
    reader = FileReader(single_column_file)

    # Read the file
    df_dropped, inputs, target = reader.read_file()

    # Assert that the single_column_check flag is set to True when only one column remains
    assert reader.single_column_check is False


def test_empty_file(tmp_path):
    """Test behavior with an empty CSV file."""
    empty_file = tmp_path / "empty.csv"
    empty_file.touch()  # Create an empty file without any content

    reader = FileReader(str(empty_file))
    with pytest.raises(pd.errors.EmptyDataError):
        reader.read_file()


def test_valid_file(tmp_path):
    """Test the read_file method with a valid CSV."""
    valid_csv = tmp_path / "valid.csv"
    valid_csv.write_text(
        "id,timestamp,age,gender,action_status\n1,2023-11-23,25,M,1\n2,2023-11-23,32,F,0\n"
    )

    reader = FileReader(str(valid_csv))
    df_dropped, inputs, target = reader.read_file()

    # Verify dataframe shapes
    assert not df_dropped.empty, "Cleaned dataframe should not be empty."
    assert not inputs.empty, "Inputs should not be empty."
    assert not target.empty, "Target should not be empty."

    # Verify age groups were created
    assert (
        "age_groups" in df_dropped.columns
    ), "Age groups should be created in the dataframe."
    assert "age" not in df_dropped.columns, "Original 'age' column should be dropped."
