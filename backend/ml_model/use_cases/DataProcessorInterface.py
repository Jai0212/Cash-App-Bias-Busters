from abc import ABC, abstractmethod


class DataProcessorInterface(ABC):
    """
    DataProcessorInterface is an abstract base class that defines the interface for processing data.

    Methods
    -------
    encode_categorical_columns()
        Abstract method to encode categorical columns in the dataset.

    drop_categorical_columns()
        Abstract method to drop categorical columns from the dataset.

    get_mappings()
        Abstract method to get the mappings used for encoding categorical columns.
    """

    @abstractmethod
    def encode_categorical_columns(self):
        pass

    @abstractmethod
    def drop_categorical_columns(self):
        pass

    @abstractmethod
    def get_mappings(self):
        pass
