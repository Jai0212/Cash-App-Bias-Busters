from abc import ABC, abstractmethod
from typing import List, Dict, Any
from fairlearn.metrics import MetricFrame


class DataPointCreator(ABC):
    """
    Abstract base class for creating DataPoint entities with metrics
    by feature groups.
    """

    def __init__(self, feature1: str, mappings: Dict, metric_frame: MetricFrame):
        """
        Initializes the DataPointCreator.

        Args:
            feature1 (str): The primary feature for grouping metrics.
            mappings (Dict): Mapping dictionary for feature labels.
            metric_frame (MetricFrame): MetricFrame containing metrics grouped by features.
        """
        self.feature1 = feature1
        self.mappings = mappings
        self.metric_frame = metric_frame

    @abstractmethod
    def data_point_list(self) -> List:
        """
        Abstract method to create a list of DataPoint entities.

        Returns:
            List: A list of DataPoint entities.
        """
        pass
