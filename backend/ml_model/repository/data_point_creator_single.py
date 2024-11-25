import sys
import os
import pandas as pd
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)
print(project_root)
from utility import model_util
from interfaces.data_point_creator_interface import DataPointCreator
from entities.datapoint_entity import DataPoint


class SingleFeatureDataPointCreator(DataPointCreator):
    """
    Concrete implementation for creating DataPoints using a single feature.
    """

    def data_point_list(self) -> list:
        """
        Creates a list of DataPoint entities with metrics by feature group
        for a single feature.

        Returns:
            List: A list of DataPoint entities.
        """
        data_points = []

        for feature1_code, metrics in self.metric_frame.by_group.iterrows():
            f1_label = model_util.get_mapped_label(self.mappings, str(self.feature1)[:-2], feature1_code)
            data_point = datapoint_creator(metrics, f1_label)

            if not model_util.is_nan_in_datapoint(data_point):
                data_points.append(data_point)

        return data_points


def datapoint_creator(metrics: pd.Series, f1_label: str) -> DataPoint:
    """
    Creates a DataPoint for a single feature column.

    Args:
        metrics (pd.Series): Metrics for the feature group.
        mappings (dict): Mapping dictionary for feature labels.
        f1_label (str): Label for the primary feature group.

    Returns:
        DataPoint: A DataPoint instance.
    """
    rounded_metrics = model_util.get_rounded_metrics(metrics)
    data_point = DataPoint(f1_label, "", rounded_metrics[0], rounded_metrics[1], rounded_metrics[2])
    return data_point
