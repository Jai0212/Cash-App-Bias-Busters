from abc import ABC, abstractmethod


class DataProcessorInterface(ABC):
    @abstractmethod
    def encode_categorical_columns(self):
        pass

    @abstractmethod
    def drop_categorical_columns(self):
        pass

    @abstractmethod
    def get_mappings(self):
        pass
