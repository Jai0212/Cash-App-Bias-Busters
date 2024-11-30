from typing import Tuple

import pandas as pd

from backend.ml_model.use_cases.FileReaderInterface import FileReaderInterface


# Mock subclass to allow instantiation and test pass statements
class MockFileReader(FileReaderInterface):
    def read_file(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
        super().read_file()  # Calls the parent method with `pass`
        return pd.DataFrame(), pd.DataFrame(), pd.Series()


# Test to ensure the pass statement is covered by invoking the abstract method
def test_pass_statement_coverage():
    reader = MockFileReader()

    # Invoke the abstract method that contains the `pass` statement
    reader.read_file()  # Executes `pass` in the parent method
