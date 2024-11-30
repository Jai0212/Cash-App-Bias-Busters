import os
import pickle
import sys

import pandas as pd

# Dynamically add the project root to the system path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)


from ml_model.repository.data_preprocessing_multiple_models import DataProcessorMultiple
from ml_model.repository.fairness import FairnessEvaluator
from ml_model.repository.file_reader_multiple_models import FileReaderMultiple
from ml_model.repository.safe_train_grid import safe_train_test_split

current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "../../../database/output.csv")


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

    # Debug: Print columns of x_test
    print(f"Columns in x_test: {x_test.columns}")

    # Update sensitive features list to match the actual column names in x_test
    sensitive_features_list = ["gender_N", "age_groups_N", "race_N", "state_N"]

    # Dictionary to store results
    results = {}

    for model_file in model_files:
        try:
            # Load the model
            with open(model_file, "rb") as f:
                model_dict = pickle.load(f)
                model = model_dict["model"]
                print(f"Loaded object type: {type(model)}")
                print(f"Loaded object: {model}")

            # Make predictions
            y_pred = model.predict(x_test)

            # Debug: Check predictions
            print(f"True Labels (y_test): {y_test.head()}")
            print(f"Predicted Labels (y_pred): {y_pred[:10]}")

            # Dictionary and list to store fairness results for the model
            model_results = {}
            fairness_values = []

            for sensitive_feature in sensitive_features_list:
                # Select the sensitive feature column for the evaluation
                if sensitive_feature in x_test.columns:
                    sensitive_col = x_test[sensitive_feature]
                    print(
                        f"Sensitive Feature: {sensitive_feature}, "
                        f"Column Data: {sensitive_col.head()}"
                    )

                    # Evaluate fairness for this specific sensitive feature
                    fairness_evaluator = FairnessEvaluator(
                        y_test, y_pred, sensitive_col
                    )
                    metric_frame = fairness_evaluator.evaluate_fairness()

                    average = sum(metric_frame.by_group["accuracy"]) / len(
                        metric_frame.by_group["accuracy"]
                    )
                    rounded = round(average, 3)

                    fairness_values.append(average)

                    # Store the metrics for this demographic
                    demo_name = sensitive_feature.replace("_N", "")
                    model_results[demo_name] = rounded
                else:
                    print(
                        f"Sensitive feature '{sensitive_feature}' "
                        f"not found in x_test."
                    )

            if fairness_values:
                model_results["variance"] = round(pd.Series(fairness_values).var(), 7)
                model_results["mean"] = round(
                    sum(fairness_values) / len(fairness_values), 3
                )
            # Store results for the model
            results[model_file] = model_results

        except Exception as e:
            results[model_file] = f"Error: {e}"

    return results
