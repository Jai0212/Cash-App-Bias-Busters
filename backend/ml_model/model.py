from typing import Any, Dict, List, Tuple
import math
import os
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn import tree
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame

single_column_check = False
current_dir = os.path.dirname(os.path.abspath(__file__))


def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series):  # type: ignore
    """
    This function will read the csv file.
    Then it will check whether there is only one column in the cleaned file
    after dropping timestamp and id.
    If age is one of these columns it will have to create bins based on age
    groups incremented by 9.
    Then our target is action_status, and it returns the cleaned file, inputs and
    action_status.
    """

    csv_file_path = os.path.join(current_dir, "../../database/output.csv")
    df = pd.read_csv(csv_file_path)

    df_cleaned = df.drop(["timestamp", "id"], axis=1, errors="ignore")

    # Check if the DataFrame has only one column
    if df_cleaned.shape[1] == 2:
        single_column_check = True

    # Check if 'age' column exists
    if "age" in df_cleaned.columns:
        bins = range(18, 90, 9)

        # Create labels for each bin
        labels = [f"{i}-{i + 8}" for i in bins[:-1]]

        # Use cut to create a new column with age groups
        df_cleaned["age_groups"] = pd.cut(
            df_cleaned["age"], bins=bins, labels=labels, right=False
        )
    else:
        df_cleaned["age_groups"] = None

    df_dropped = df_cleaned.drop("age", axis=1, errors="ignore")

    inputs = df_dropped.drop(
        "action_status", axis="columns", errors="ignore"
    )  # Ignore error if 'is_biased' does not exist
    target = df_dropped.get(
        "action_status", pd.Series()
    )  # Get 'is_biased' or an empty Series if it does not exist

    return df_cleaned, inputs, target


def labels_encoder():
    """
    Creates labels for each parameter and enumerates them for the ML model.
    """
    le_dict = {}
    categorical_columns = [
        "gender",
        "age_groups",
        "race",
        "state",
    ]  # Define your categorical columns

    df, inputs, _ = file_reader()

    # Create LabelEncoders for each categorical column
    for col in categorical_columns:
        if col in inputs.columns:  # Check if the column exists in inputs
            le = LabelEncoder()
            inputs[f"{col}_N"] = le.fit_transform(inputs[col])  # Encode the column
            le_dict[col] = le  # Store the label encoder in a dictionary

    # Get mappings from numeric codes back to labels
    mappings = {
        col: dict(zip(le.transform(le.classes_), le.classes_))
        for col, le in le_dict.items()
    }

    # Keep the specified columns: 'id', 'timestamp', 'is_biased'
    inputs_n = inputs.drop(columns=categorical_columns, errors="ignore")
    return inputs_n, mappings


def model() -> dict:
    """
    Final model.
    """
    inputs, mappings = labels_encoder()  # Get encoded inputs and mappings
    _, _, target = file_reader()  # Get the target variable

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        inputs, target, test_size=0.2, random_state=48
    )

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
    grid_search.fit(X_train, y_train)

    # Get the best model from grid search
    best_clf = grid_search.best_estimator_

    # Get predictions
    y_pred = best_clf.predict(X_test)
    feature1 = inputs.columns[0]

    # Specify multiple sensitive features
    if (
        "single_column_check" in globals() and single_column_check
    ):  # Ensure single_column_check is defined
        sensitive_features = X_test[[feature1]]  # Add your sensitive features here
    else:
        feature2 = inputs.columns[1]
        sensitive_features = X_test[
            [feature1, feature2]
        ]  # Add your sensitive features here

    # Create a MetricFrame to evaluate fairness
    metric_frame = MetricFrame(
        metrics={
            "accuracy": lambda y_true, y_pred: np.mean(y_true == y_pred),
            "false_positive_rate": lambda y_true, y_pred: np.mean(
                (y_true == 0) & (y_pred == 1)
            ),
            "false_negative_rate": lambda y_true, y_pred: np.mean(
                (y_true == 1) & (y_pred == 0)
            ),
        },
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_features,  # Pass the DataFrame with multiple sensitive features
    )

    # Print metrics for each group
    print(metric_frame.by_group)

    # Overall model score
    score = best_clf.score(X_test, y_test)

    # Save the model and its score
    with open("model_with_score.pkl", "wb") as f:
        pickle.dump({"model": best_clf, "score": score}, f)

        # Create dictionary with mapped keys
        bias_dictionary = {}
        for (feature1_code, feature2_code), metrics in metric_frame.by_group.iterrows():

            f1_label = mappings[feature1.removesuffix("_N")].get(
                feature1_code, "Unknown Feature"
            )
            if "single_column_check" in globals() and single_column_check:
                key = str(f1_label)
            else:
                feature2 = inputs.columns[1]
                f2_label = mappings[feature2.removesuffix("_N")].get(
                    feature2_code, "Unknown Feature"
                )
                key = (str(f1_label), str(f2_label))

            bias_dictionary[key] = [
                round(metrics["accuracy"], 3),
                round(metrics["false_positive_rate"], 3),
                round(metrics["false_negative_rate"], 3),
            ]

    # Cleaned dictionary without NaN values
    cleaned_bias_dictionary = {
        k: v for k, v in bias_dictionary.items() if not any(math.isnan(x) for x in v)
    }

    # Sort dictionary by race_label and then by age_label
    sorted_bias_dictionary = dict(
        sorted(
            cleaned_bias_dictionary.items(), key=lambda item: (item[0][0], item[0][1])
        )
    )

    return sorted_bias_dictionary


if __name__ == "__main__":
    # Execute the model function and print the score
    print(model())
