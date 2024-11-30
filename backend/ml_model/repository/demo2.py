import os
import pickle

from data_preprocessing import DataProcessor
from file_reader import FileReader
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.tree import DecisionTreeClassifier

# Define the dataset path
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_file_path = os.path.join(current_dir, "single_transaction.csv")


def train_and_save_decision_tree_models():
    """
    Train 5 decision tree models with different configurations and save them as .pkl files.
    """
    # Load and preprocess data
    file_reader = FileReader(csv_file_path)
    df_dropped, inputs, target = file_reader.read_file()

    data_processor = DataProcessor(inputs)
    inputs_encoded = data_processor.encode_categorical_columns()
    inputs_n = data_processor.drop_categorical_columns()

    # Define configurations for five models
    model_configs = [
        {
            "criterion": "gini",
            "max_depth": [3, 5],
            "min_samples_split": [2, 3],
            "test_size": 0.3,
        },
        {
            "criterion": "entropy",
            "max_depth": [None, 10],
            "min_samples_split": [2],
            "test_size": 0.25,
        },
        {
            "criterion": "gini",
            "max_depth": [8, 12],
            "min_samples_split": [5, 10],
            "test_size": 0.2,
        },
        {
            "criterion": "entropy",
            "max_depth": [5],
            "min_samples_split": [3, 4],
            "test_size": 0.35,
        },
        {
            "criterion": "gini",
            "max_depth": [7, 9],
            "min_samples_split": [6, 8],
            "test_size": 0.3,
        },
    ]

    for i, config in enumerate(model_configs, start=1):
        # Split the data
        x_train, x_test, y_train, y_test = train_test_split(
            inputs_n, target, test_size=config["test_size"], random_state=42
        )

        # Define the grid search parameters
        param_grid = {
            "criterion": [config["criterion"]],  # Use specific criterion for each model
            "max_depth": config["max_depth"],
            "min_samples_split": config["min_samples_split"],
        }

        # Perform grid search
        grid_search = GridSearchCV(
            DecisionTreeClassifier(), param_grid, cv=5, scoring="accuracy"
        )
        grid_search.fit(x_train, y_train)
        best_clf = grid_search.best_estimator_
        score = best_clf.score(x_test, y_test)

        # Save the trained model
        model_path = os.path.join(current_dir, f"model_for_demo{i}.pkl")
        with open(model_path, "wb") as f:
            pickle.dump({"model": best_clf, "score": score}, f)

        print(f"Model {i} saved at: {model_path}")


if __name__ == "__main__":
    train_and_save_decision_tree_models()
