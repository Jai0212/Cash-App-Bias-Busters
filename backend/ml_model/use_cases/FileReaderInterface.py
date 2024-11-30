from abc import ABC, abstractmethod
from typing import Tuple

import pandas as pd


class FileReaderInterface(ABC):
    """
    Abstract base class for file readers.
    Defines the contract for reading and processing files.
    """

    @abstractmethod
    def read_file(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
        """
        Reads and processes a file.

        :return: A tuple containing the cleaned DataFrame, input features DataFrame, and target Series.
        """
        pass
