from fairness import FairnessEvaluator
from file_reader import FileReader
from data_preprocessing import DataProcessor
from safe_test import safe_train_test_split, safe_grid_search
import pickle
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir,
                             "../../../database/full_single_transaction.csv")


def multiple_models_tester(model_files):
    file_reader = FileReader(csv_file_path)
    df_dropped, inputs, target = file_reader.read_file()

    data_processor = DataProcessor(inputs)
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
                model = pickle.load(f)

            # Make predictions
            y_pred = model.predict(x_test)

            # Evaluate fairness
            fairness_evaluator = FairnessEvaluator(y_test, y_pred, sensitive_features)
            metric_frame = fairness_evaluator.evaluate_fairness()

            # Store the metrics
            results[model_file] = metric_frame
        except Exception as e:
            results[model_file] = f"Error: {e}"

    return results

