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


def model() -> list:
    """
    Calls all the appropriate functions to fit a model and do parameter search.
    Then returns the findings to be displayed by the graphs.
    """
    # Step 1: Load and preprocess data
    file_reader = FileReader(csv_file_path)
    df_dropped, inputs, target = file_reader.read_file()

    # Step 2: Encode categorical columns using DataProcessor
    data_processor = DataProcessor(inputs)
    inputs_encoded = data_processor.encode_categorical_columns()
    mappings = data_processor.get_mappings()
    inputs_n = data_processor.drop_categorical_columns()

    # Step 3: Split the data into training and test sets
    x_train, x_test, y_train, y_test = train_test_split(
        inputs_n, target, test_size=0.2, random_state=48
    )

    # Step 4: Define and tune the model using grid search
    best_clf = grid_search(x_train, y_train)

    # Step 5: Make predictions
    y_pred = best_clf.predict(x_test)
    feature1 = inputs_n.columns[0]

    # Step 6: Handle sensitive features for fairness evaluation
    sensitive_features = x_test[[feature1]] if file_reader.single_column_check \
        else x_test[[feature1, inputs_n.columns[1]]]

    # Step 7: Evaluate fairness using Fairlearn's MetricFrame
    metric_frame = evaluate_fairness(y_test, y_pred, sensitive_features)

    # Step 8: Save the model
    save_model(best_clf, x_test, y_test)

    # Step 9: Create, clean, and sort bias dictionary
    data_point_list = create_bias_data_points(feature1, inputs, mappings, metric_frame, file_reader.single_column_check)
    data_point_list = clean_datapoints(data_point_list)

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


def clean_datapoints(data_point_list: list[DataPoint]) -> list[DataPoint]:
    """
    Cleans the list of DataPoint objects from instances with NaN in them.
    """
    return [x for x in data_point_list if x.feature1 != "NaN" and x.feature2 != "NaN"]


def create_bias_data_points(
        feature1: str,
        inputs: pd.DataFrame,
        mappings: dict,
        metric_frame: MetricFrame,
        single_column_check: bool = False) -> list:
    """
    Creates a list of DataPoint entities with metrics by feature group.
    """
    data_points = []

    for (feature1_code, feature2_code), metrics in metric_frame.by_group.iterrows():

        f1_label = get_mapped_label(mappings, feature1, feature1_code)

        if single_column_check:
            data_point = single_column_datapoint(metrics, mappings, f1_label)
        else:
            data_point = multiple_column_datapoint(metrics, f1_label, mappings, feature2_code, inputs)

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
    f2_label = get_mapped_label(mappings, feature2, feature2_code)
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
