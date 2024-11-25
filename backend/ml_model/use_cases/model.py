from sklearn import tree
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame
import numpy as np
import pandas as pd
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

from ml_model.repository.file_reader import FileReader
from ml_model.entities.datapoint_entity import DataPoint
from ml_model.repository.model_saver import save_model
from ml_model.repository.data_preprocessing import DataProcessor
from ml_model.repository.fairness import FairnessEvaluator
from ml_model.repository.safe_train_grid import (safe_train_test_split,safe_grid_search)
from ml_model.utility import model_util
from ml_model.repository.data_point_creator_single import SingleFeatureDataPointCreator
from ml_model.repository.data_point_creator_multiple import MultiFeatureDataPointCreator

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "../../../database/output.csv")

from sklearn.model_selection import train_test_split, KFold
from sklearn.exceptions import NotFittedError


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
        return []  # Early exit if there aren't enough samples

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
    fairness_evaluator = FairnessEvaluator(y_test, y_pred, sensitive_features)
    metric_frame = fairness_evaluator.evaluate_fairness()
    # Save the model
    save_model(best_clf, x_test, y_test)

    # Create, clean, and sort bias dictionary
    if file_reader.single_column_check:
        dp_processor = SingleFeatureDataPointCreator(feature1, mappings, metric_frame)
        data_point_list = dp_processor.data_point_list()
    else:
        dp_processor = MultiFeatureDataPointCreator(feature1, mappings, metric_frame, inputs_n)
        data_point_list = dp_processor.data_point_list()

    data_point_list = model_util.clean_datapoints(file_reader, data_point_list)

    return data_point_list
