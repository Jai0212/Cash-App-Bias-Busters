import pickle
import os
import sys

# Dynamically add the project root to the system path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)


from ml_model.repository.fairness import FairnessEvaluator
from ml_model.repository.file_reader_multiple_models import FileReaderMultiple
from ml_model.repository.data_preprocessing_multiple_models import (
    DataProcessorMultiple)
from ml_model.repository.safe_train_grid import (safe_train_test_split,
                                                 safe_grid_search)

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir,
                             "../../../database/full_single_transaction.csv")


def evaluate_multiple_models(model_files):
    file_reader = FileReaderMultiple(csv_file_path)
    df_dropped, inputs, target = file_reader.read_file()

    data_processor = DataProcessorMultiple(inputs)
    inputs_encoded = data_processor.encode_categorical_columns()
    inputs_n = data_processor.drop_categorical_columns()

    split_data = safe_train_test_split(inputs_n, target)
    if split_data is None:
        return {}

    x_train, x_test, y_train, y_test = split_data

    # Handle sensitive features
    feature1 = inputs_n.columns[0]
    sensitive_features = x_test[[feature1]] if file_reader.single_column_check \
        else x_test[[feature1, inputs_n.columns[1]]]

    # Dictionary to store results
    results = {}
    for model_file in model_files:
        try:
            # Load the model
            with open(model_file, 'rb') as f:
                model_dict = pickle.load(f)
                model = model_dict['model']
                print(f"Loaded object type: {type(model)}")
                print(f"Loaded object: {model}")

            # Make predictions
            y_pred = model.predict(x_test)

            # Evaluate fairness
            fairness_evaluator = FairnessEvaluator(y_test, y_pred,
                                                   sensitive_features)
            metric_frame = fairness_evaluator.evaluate_fairness()

            # Store the metrics
            results[model_file] = metric_frame
        except Exception as e:
            results[model_file] = f"Error: {e}"

    return results

