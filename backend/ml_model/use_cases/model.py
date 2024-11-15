from sklearn import tree
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame
import numpy as np
import pandas as pd
import sys
import os


# Add the root directory of the project to the sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

# Now import the modules
from ml_model.repository.file_reader import FileReader
from ml_model.entities.datapoint_entity import DataPoint
from ml_model.repository.model_saver import save_model
from ml_model.repository.data_preprocessing import DataProcessor

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "../../../database/output.csv")

from sklearn.model_selection import train_test_split, KFold
from sklearn.exceptions import NotFittedError

def safe_train_test_split(inputs, target, test_size=0.2, random_state=48):
    try:
        x_train, x_test, y_train, y_test = train_test_split(
            inputs, target, test_size=test_size, random_state=random_state
        )
        return x_train, x_test, y_train, y_test
    except ValueError as e:
        if "With n_samples=0" in str(e):
            print("Not enough samples to split. Returning None.")
            return None  # Returning None when there aren't enough samples
        else:
            raise e  # Re-raise any other ValueErrors

def safe_grid_search(x_train, y_train):
    try:
        # Perform grid search
        clf = DecisionTreeClassifier()
        param_grid = {
            "criterion": ["gini", "entropy"],
            "max_depth": [None] + list(range(1, 11)),
            "min_samples_split": [2, 5, 10],
        }
        grid_search = GridSearchCV(clf, param_grid, cv=5, scoring="accuracy")
        grid_search.fit(x_train, y_train)
        return grid_search.best_estimator_
    except ValueError as e:
        if "Cannot have number of splits n_splits" in str(e):
            print("Not enough samples for cross-validation. Returning None.")
            return None  # Returning None when there aren't enough samples
        else:
            raise e  # Re-raise other ValueErrors

def model():
    """
    Calls all the appropriate functions to fit a model and do parameter search.
    Then returns the findings to be displayed by the graphs.
    """
    # Load and preprocess data
    file_reader = FileReader(csv_file_path)
    df_dropped, inputs, target = file_reader.read_file()

    # Encode categorical columns using DataProcessor
    data_processor = DataProcessor(inputs)
    inputs_encoded = data_processor.encode_categorical_columns()
    mappings = data_processor.get_mappings()
    inputs_n = data_processor.drop_categorical_columns()

    # Split data
    split_data = safe_train_test_split(inputs_n, target)
    if split_data is None:
        return None  # Early exit if there aren't enough samples

    x_train, x_test, y_train, y_test = split_data

    # Perform grid search for hyperparameter tuning
    best_clf = safe_grid_search(x_train, y_train)
    if best_clf is None:
        return None  # Early exit if grid search fails due to insufficient samples

    # Make predictions
    y_pred = best_clf.predict(x_test)

    # Handle sensitive features for fairness evaluation
    feature1 = inputs_n.columns[0]
    sensitive_features = x_test[[feature1]] if file_reader.single_column_check \
        else x_test[[feature1, inputs_n.columns[1]]]

    # Evaluate fairness
    metric_frame = evaluate_fairness(y_test, y_pred, sensitive_features)

    # Save the model
    save_model(best_clf, x_test, y_test)

    # Create, clean, and sort bias dictionary
    data_point_list = create_bias_data_points(feature1, inputs_n, mappings, metric_frame, file_reader.single_column_check)
    data_point_list = clean_datapoints(filereader, data_point_list)

    print(data_point_list)

    return data_point_list



def grid_search(x_train, y_train) -> object:
    """
    Performs a grid search to tune hyperparameters for the decision tree classifier.
    Returns the best classifier after grid search.
    """
    clf = DecisionTreeClassifier()
    param_grid = {
        "criterion": ["gini", "entropy"],
        "max_depth": [None] + list(range(1, 11)),
        "min_samples_split": [2, 5, 10],
    }

    grid_search = GridSearchCV(clf, param_grid, cv=5, scoring="accuracy")
    grid_search.fit(x_train, y_train)

    return grid_search.best_estimator_


def evaluate_fairness(y_true, y_pred, sensitive_features) -> MetricFrame:
    """
    Evaluates fairness of the model's predictions based on sensitive features.
    Returns a MetricFrame object with fairness metrics.
    """
    metric_frame = MetricFrame(
        metrics={
            "accuracy": lambda y_true, y_pred: np.mean(y_true == y_pred),
            "false_positive_rate": lambda y_true, y_pred: np.mean((y_true == 0) & (y_pred == 1)),
            "false_negative_rate": lambda y_true, y_pred: np.mean((y_true == 1) & (y_pred == 0)),
        },
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sensitive_features,
    )

    return metric_frame


def clean_datapoints(filereader: FileReader, data_point_list: list[DataPoint]) -> list[DataPoint]:
    """
    Cleans the list of DataPoint objects from instances with NaN in them.
    """
    if filereader.single_column_check:
        return [x for x in data_point_list if
                x.feature1 != "NaN"]

    return [x for x in data_point_list if x.feature1 != "NaN" and  x.feature2 != "NaN"]


def is_nan_in_datapoint(data_point) -> bool:
    """
    Checks if any attribute of a data point contains NaN.
    """
    return any(pd.isna(value) for value in data_point.__dict__.values())


def create_bias_data_points_single(
        feature1: str,
        inputs: pd.DataFrame,
        mappings: dict,
        metric_frame: MetricFrame,
        single_column_check: bool = False) -> list:
    """
    Creates a list of DataPoint entities with metrics by feature group,
    discarding any DataPoints with NaN values.
    """
    data_points = []

    for (feature1_code, feature2_code), metrics in metric_frame.by_group.iterrows():
        f1_label = get_mapped_label(mappings, str(feature1)[:-2], feature1_code)

        if single_column_check:
            data_point = single_column_datapoint(metrics, mappings, f1_label)
        else:
            data_point = multiple_column_datapoint(metrics, f1_label, mappings, feature2_code, inputs)

        # Only append if there are no NaN values in the DataPoint
        if not is_nan_in_datapoint(data_point):
            data_points.append(data_point)

    return data_points

def create_bias_data_points_multiple(
        feature1: str,
        inputs: pd.DataFrame,
        mappings: dict,
        metric_frame: MetricFrame,
        single_column_check: bool = False) -> list:
    """
    Creates a list of DataPoint entities with metrics by feature group,
    discarding any DataPoints with NaN values.
    """
    data_points = []

    for (feature1_code, feature2_code), metrics in metric_frame.by_group.iterrows():
        f1_label = get_mapped_label(mappings, str(feature1)[:-2], feature1_code)

        if single_column_check:
            data_point = single_column_datapoint(metrics, mappings, f1_label)
        else:
            data_point = multiple_column_datapoint(metrics, f1_label, mappings, feature2_code, inputs)

        # Only append if there are no NaN values in the DataPoint
        if not is_nan_in_datapoint(data_point):
            data_points.append(data_point)

    return data_points


def single_column_datapoint(metrics: pd.Series, mappings: dict, f1_label: str) -> DataPoint:
    """
    Creates a DataPoint for a single feature column.
    """
    rounded_metrics = get_rounded_metrics(metrics)
    data_point = DataPoint(f1_label, "", rounded_metrics[0], rounded_metrics[1], rounded_metrics[2])
    return data_point


def multiple_column_datapoint(metrics: pd.Series, f1_label: str, mappings: dict, feature2_code: any,
                              inputs: pd.DataFrame) -> DataPoint:
    """
    Creates a DataPoint for multiple feature columns.
    """
    feature2 = inputs.columns[1]
    f2_label = get_mapped_label(mappings, str(feature2)[:-2], feature2_code)
    rounded_metrics = get_rounded_metrics(metrics)
    data_point = DataPoint(f1_label, f2_label, rounded_metrics[0], rounded_metrics[1], rounded_metrics[2])
    return data_point


def get_mapped_label(mappings: dict, feature: str, code: any) -> str:
    """
    Gets the mapped label for a given feature code.

    Args:
        mappings (dict): Dictionary containing the mappings for categorical values.
        feature (str): The name of the feature.
        code (any): The code for which to find the mapped label.

    Returns:
        str: The mapped label for the feature code, or the code itself if no mapping is found.
    """
    feature_mapping = mappings.get(feature, {})
    return feature_mapping.get(code, str(code))


def get_rounded_metrics(metrics: pd.Series) -> tuple:
    """
    Rounds the metrics in the series to two decimal places.

    Args:
        metrics (pd.Series): Series containing metrics like accuracy, false positive rate, and false negative rate.

    Returns:
        tuple: Rounded values of the metrics (accuracy, false positive rate, false negative rate).
    """
    accuracy = round(metrics.get("accuracy", 0), 2)
    false_positive_rate = round(metrics.get("false_positive_rate", 0), 2)
    false_negative_rate = round(metrics.get("false_negative_rate", 0), 2)

    return accuracy, false_positive_rate, false_negative_rate


if __name__ == "__main__":
    # Execute the model function and print the score
    print(model())
