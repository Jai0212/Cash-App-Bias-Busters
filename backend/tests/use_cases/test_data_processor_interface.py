from backend.ml_model.use_cases.DataProcessorInterface import DataProcessorInterface


# Mock subclass to allow instantiation and test pass statements
class MockDataProcessor(DataProcessorInterface):
    def encode_categorical_columns(self):
        super().encode_categorical_columns()  # Calls the parent method with `pass`

    def drop_categorical_columns(self):
        super().drop_categorical_columns()  # Calls the parent method with `pass`

    def get_mappings(self):
        super().get_mappings()  # Calls the parent method with `pass`


# Test to ensure the pass statements are covered by invoking the abstract methods
def test_pass_statement_coverage():
    processor = MockDataProcessor()

    # Invoke methods that contain the `pass` statement
    processor.encode_categorical_columns()  # Executes `pass` in the parent method
    processor.drop_categorical_columns()  # Executes `pass` in the parent method
    processor.get_mappings()  # Executes `pass` in the parent method
