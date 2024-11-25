from fairlearn.metrics import MetricFrame
import pandas as pd
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from interfaces.data_point_creator_interface import DataPointCreator


class MultiFeatureDataPointCreator(DataPointCreator):
    """
    Concrete implementation for creating DataPoints using multiple features.
    """

    def __init__(self, feature1: str, mappings: Dict, metric_frame: MetricFrame, inputs: pd.DataFrame):
        """
        Initializes the MultiFeatureDataPointCreator.

        Args:
            feature1 (str): The primary feature for grouping metrics.
            mappings (Dict): Mapping dictionary for feature labels.
            metric_frame (MetricFrame): MetricFrame containing metrics grouped by features.
            inputs (pd.DataFrame): Input DataFrame containing feature columns.
        """
        super().__init__(feature1, mappings, metric_frame)
        self.inputs = inputs

    def create_data_points(self) -> List:
        """
        Creates a list of DataPoint entities with metrics by feature group
        for multiple features.

        Returns:
            List: A list of DataPoint entities.
        """
        data_points = []

        for (feature1_code, feature2_code), metrics in self.metric_frame.by_group.iterrows():
            f1_label = model_util.get_mapped_label(self.mappings, str(self.feature1)[:-2], feature1_code)
            data_point = multiple_column_datapoint(metrics, f1_label, self.mappings, feature2_code, self.inputs)

            if not is_nan_in_datapoint(data_point):
                data_points.append(data_point)

        return data_points

    """
        Creates a DataPoint for multiple feature columns.

        Args:
            metrics (pd.Series): Metrics for the feature group.
            f1_label (str): Label for the primary feature group.
            mappings (dict): Mapping dictionary for feature labels.
            feature2_code (Any): Code for the secondary feature group.
            inputs (pd.DataFrame): Input DataFrame containing feature columns.

        Returns:
            DataPoint: A DataPoint instance.
        """

    def datapoint_creator(self) -> DataPoint:
        """
        Creates a DataPoint for multiple feature columns
        """

        feature2 = inputs.columns[1]
        f2_label = model_util.get_mapped_label(mappings, str(feature2)[:-2], feature2_code)
        rounded_metrics = model_util.get_rounded_metrics(metrics)
        data_point = DataPoint(f1_label, f2_label, rounded_metrics[0], rounded_metrics[1], rounded_metrics[2])
        return data_point
