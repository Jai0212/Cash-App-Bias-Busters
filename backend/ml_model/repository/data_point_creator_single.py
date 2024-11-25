from fairlearn.metrics import MetricFrame
import pandas as pd

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from interfaces.data_point_creator_interface import DataPointCreator


class SingleFeatureDataPointCreator(DataPointCreator):
    """
    Concrete implementation for creating DataPoints using a single feature.
    """

    def __init__(self, feature1: str, mappings: Dict, metric_frame: MetricFrame):
        """
        Initializes the MultiFeatureDataPointCreator.

        Args:
            feature1 (str): The primary feature for grouping metrics.
            mappings (Dict): Mapping dictionary for feature labels.
            metric_frame (MetricFrame): MetricFrame containing metrics grouped by features.
        """
        super().__init__(feature1, mappings, metric_frame)

    def data_point_list(self) -> List:
        """
        Creates a list of DataPoint entities with metrics by feature group
        for a single feature.

        Returns:
            List: A list of DataPoint entities.
        """
        data_points = []

        for feature1_code, metrics in self.metric_frame.by_group.iterrows():
            f1_label = model_util.get_mapped_label(self.mappings, str(self.feature1)[:-2], feature1_code)
            data_point = datapoint_creator(metrics, self.mappings, f1_label)

            if not is_nan_in_datapoint(data_point):
                data_points.append(data_point)

        return data_points

    def datapoint_creator(self) -> DataPoint:
        """
        Creates a DataPoint for a single feature column.

        Args:
            metrics (pd.Series): Metrics for the feature group.
            mappings (dict): Mapping dictionary for feature labels.
            f1_label (str): Label for the primary feature group.

        Returns:
            DataPoint: A DataPoint instance.
        """
        rounded_metrics = model_util.get_rounded_metrics(self.metrics)
        data_point = DataPoint(self.f1_label, "", rounded_metrics[0], rounded_metrics[1], rounded_metrics[2])
        return data_point
