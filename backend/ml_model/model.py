from typing import Dict
import math
import pickle
import numpy as np
from sklearn import tree
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame
from reader import file_reader
from labels_encoder import labels_encoder

single_column_check = False


def model() -> dict:
    """
    Final model.
    """
    inputs, mappings = labels_encoder()  # Get encoded inputs and mappings
    _, _, target = file_reader()  # Get the target variable

    # Split the data into training and test sets
    x_train, x_test, y_train, y_test = (
        train_test_split(inputs, target, test_size=0.2, random_state=48))

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

    # Print metrics for each group
    print(metric_frame.by_group)

    # Overall model score
    score = best_clf.score(x_test, y_test)

    # Save the model and its score
    with open("model_with_score.pkl", "wb") as f:
        pickle.dump({"model": best_clf, "score": score}, f)

    bias_dictionary = create_bias_dictionary(feature1, inputs,
                                             mappings, metric_frame)

    # Cleaned dictionary without NaN values
    cleaned_bias_dictionary = clean_bias_dictionary(bias_dictionary)

    # Sort dictionary by race_label and then by age_label
    sorted_bias_dictionary = sort_bias_dictionary(cleaned_bias_dictionary)

    return sorted_bias_dictionary


def sort_bias_dictionary(cleaned_bias_dictionary):
    return dict(sorted(cleaned_bias_dictionary.items(),
                       key=lambda item: (item[0][0], item[0][1])))


def clean_bias_dictionary(bias_dictionary):
    return {k: v for k, v in bias_dictionary.items()
            if not any(math.isnan(x) for x in v)}


def create_bias_dictionary(feature1, inputs, mappings, metric_frame):
    # Create dictionary with mapped keys
    bias_dictionary = {}
    for (feature1_code, feature2_code), metrics in metric_frame.by_group.iterrows():

        f1_label = mappings[feature1.removesuffix("_N")].get(
            feature1_code, "Unknown Feature")
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
            round(metrics["false_negative_rate"], 3),]

    return bias_dictionary


if __name__ == "__main__":
    # Execute the model function and print the score
    print(model())
