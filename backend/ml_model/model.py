from typing import Dict, Tuple
import math
import pickle
import os
import pandas as pd
import numpy as np
from data_access.file_reader import FileReader
from sklearn import tree
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame

single_column_check = False
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "../../database/output.csv")
categorical_columns = ["gender", "age_groups", "race", "state"]


def labels_encoder():
    """
    Orchestrates label encoding and returns encoded data along with mappings.
    """
    file_reader = FileReader(csv_file_path)
    _, inputs, _ = file_reader.read_file()
    le_dict = {}
    inputs = encode_categorical_columns(inputs, le_dict)
    mappings = get_mappings(le_dict)
    inputs_n = drop_categorical_columns(inputs)
    return inputs_n, mappings


def encode_categorical_columns(inputs: pd.DataFrame, le_dict: dict) -> pd.DataFrame:
    """
    Encodes each categorical column using LabelEncoder.
    """
    for col in categorical_columns:
        if col in inputs.columns:
            le = LabelEncoder()
            inputs[f"{col}_N"] = le.fit_transform(inputs[col])
            le_dict[col] = le
    return inputs


def get_mappings(le_dict: dict) -> dict:
    """
    Retrieves mappings from encoded values to original labels.
    """
    return {
        col: dict(zip(le.transform(le.classes_), le.classes_))
        for col, le in le_dict.items()
    }


def drop_categorical_columns(inputs: pd.DataFrame) -> pd.DataFrame:
    """
    Drops the original categorical columns and returns necessary columns.
    """
    return inputs.drop(columns=categorical_columns, errors="ignore")


def model() -> dict:
    """
    Calls all the appropriate functions to fit a model and do parameter search. Then returns the findings to
    be displayed by the graphs.
    """
    inputs, mappings = labels_encoder()  # Get encoded inputs and mappings
    _, _, target = file_reader()  # Get the target variable

    # Split the data into training and test sets
    x_train, x_test, y_train, y_test = (train_test_split(inputs, target, test_size=0.2, random_state=48))

    # Define the model
    clf = tree.DecisionTreeClassifier()

    # Set up the parameter grid for hyperparameter tuning
    param_grid = {
        "criterion": ["gini", "entropy"],
        "max_depth": [None] + list(range(1, 11)),  # Example depth values
        "min_samples_split": [2, 5, 10],
    }

    # Initialize GridSearchCV
    grid_search = GridSearchCV(clf, param_grid, cv=5, scoring="accuracy")

    # Fit the model
    grid_search.fit(x_train, y_train)

    # Get the best model from grid search
    best_clf = grid_search.best_estimator_

    # Get predictions
    y_pred = best_clf.predict(x_test)
    feature1 = inputs.columns[0]

    # Specify multiple sensitive features
    if "single_column_check" in globals() and single_column_check:  # Ensure single_column_check is defined
        sensitive_features = x_test[[feature1]]  # Add your sensitive features here
    else:
        feature2 = inputs.columns[1]
        sensitive_features = x_test[[feature1, feature2]]  # Add your sensitive features here

    # Create a MetricFrame to evaluate fairness
    metric_frame = MetricFrame(
        metrics={
            "accuracy": lambda y_true, y_pred: np.mean(y_true == y_pred),
            "false_positive_rate": lambda y_true, y_pred: np.mean(
                (y_true == 0) & (y_pred == 1)),
            "false_negative_rate": lambda y_true, y_pred: np.mean(
                (y_true == 1) & (y_pred == 0)), },
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_features,)  # Pass the DataFrame with multiple sensitive features

    save_model(best_clf, x_test, y_test)
    bias_dictionary = create_bias_dictionary(feature1, inputs, mappings, metric_frame, single_column_check)
    cleaned_bias_dictionary = clean_bias_dictionary(bias_dictionary)    # Cleaned dictionary without NaN values
    sorted_bias_dictionary = sort_bias_dictionary(cleaned_bias_dictionary)

    return sorted_bias_dictionary


def save_model(best_clf: GridSearchCV, x_test: pd.DataFrame, y_test: pd.Series) -> None:
    """
    Saves the model as a pkl file
    """
    # Overall model score
    score = best_clf.score(x_test, y_test)

    # Save the model and its score
    with open("model_with_score.pkl", "wb") as f:
        pickle.dump({"model": best_clf, "score": score}, f)


def sort_bias_dictionary(cleaned_bias_dictionary) -> dict:
    """
    Sorts the dictionary with appropriate conditions
    """
    return dict(sorted(cleaned_bias_dictionary.items(),
                       key=lambda item: (item[0][0], item[0][1])))


def clean_bias_dictionary(bias_dictionary) -> dict:
    """
    Cleans the dictionary of NaN values
    """
    return {k: v for k, v in bias_dictionary.items()
            if not any(math.isnan(x) for x in v)}


def create_bias_dictionary(
        feature1: str,
        inputs: pd.DataFrame,
        mappings: dict,
        metric_frame: MetricFrame,
        single_column_check: bool = False) -> dict:
    """
    Creates a bias dictionary with metrics by feature group.
    """
    bias_dictionary = {}

    for (feature1_code, feature2_code), metrics in (
            metric_frame.by_group.iterrows()):

        f1_label = get_mapped_label(mappings, feature1, feature1_code)

        if single_column_check:
            key = str(f1_label)
        else:
            feature2 = inputs.columns[1]
            f2_label = get_mapped_label(mappings, feature2, feature2_code)
            key = (str(f1_label), str(f2_label))

        bias_dictionary[key] = get_rounded_metrics(metrics)

    return bias_dictionary


def get_mapped_label(mappings: dict, feature: str, code: any) -> str:
    """
    Retrieves the label from mappings based on the feature and code.
    """
    return (mappings.get(feature.removesuffix("_N"), {}).
            get(code, "Unknown Feature"))


def get_rounded_metrics(metrics: pd.Series) -> list:
    """
    Rounds and returns relevant metrics as a list.
    """
    return [
        round(metrics["accuracy"], 3),
        round(metrics["false_positive_rate"], 3),
        round(metrics["false_negative_rate"], 3),
    ]


if __name__ == "__main__":
    # Execute the model function and print the score
    print(model())
