import os
import sys

from sklearn import tree

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)

from backend.ml_model.repository.data_point_creator_multiple import MultiFeatureDataPointCreator
from backend.ml_model.repository.data_point_creator_single import SingleFeatureDataPointCreator
from backend.ml_model.repository.data_preprocessing import DataProcessor
from backend.ml_model.repository.fairness import FairnessEvaluator
from backend.ml_model.repository.file_reader import FileReader
from backend.ml_model.repository.model_saver import ModelSaver
from backend.ml_model.repository.safe_split import SafeSplitter
from backend.ml_model.repository.safe_grid_search import SafeGridSearch
from backend.ml_model.utility import model_util

current_dir = os.path.dirname(os.path.abspath(__file__))
file_path_csv = os.path.join(current_dir, "../../../database/output.csv")


class ModelTrainer:
    """
    A class that encapsulates the process of training a machine learning model,
    performing hyperparameter tuning, evaluating fairness, and saving the trained model.

    This class performs the following steps:
    1. Loads and preprocesses the data.
    2. Splits the data into training and testing sets.
    3. Performs grid search for hyperparameter tuning.
    4. Makes predictions.
    5. Evaluates fairness across sensitive features.
    6. Saves the model and prepares data for visualization.
    """

    def __init__(self, csv_file_path=file_path_csv, test_size=0.2, random_state=48):
        """
        Initializes the ModelTrainer with necessary parameters.

        Parameters:
        -----------
        csv_file_path : str
            The path to the CSV file containing the dataset.

        test_size : float, optional (default=0.2)
            The proportion of the dataset to be used for testing.

        random_state : int, optional (default=48)
            The random seed used for reproducibility in train-test splitting.
        """
        self.csv_file_path = csv_file_path
        self.test_size = test_size
        self.random_state = random_state

    def load_and_preprocess_data(self):
        """
        Loads the data from a CSV file, processes it by dropping irrelevant columns,
        and encodes categorical variables.

        Returns:
        --------
        tuple : (df_dropped, inputs, target)
            - df_dropped : DataFrame with dropped columns
            - inputs : DataFrame with the feature columns
            - target : Series with the target variable
            - file_reader: FileReader object
        """
        file_reader = FileReader(self.csv_file_path)
        return (file_reader.read_file(), file_reader)

    def encode_data(self, inputs):
        """
        Encodes categorical columns and returns the encoded inputs.

        Parameters:
        -----------
        inputs : pd.DataFrame
            The input feature set to be encoded.

        Returns:
        --------
        tuple : (inputs_encoded, mappings, inputs_n)
            - inputs_encoded : The inputs with categorical columns encoded
            - mappings : A dictionary of mappings for encoding
            - inputs_n : The inputs with categorical columns dropped
        """
        data_processor = DataProcessor(inputs)
        inputs_encoded = data_processor.encode_categorical_columns()
        mappings = data_processor.get_mappings()
        inputs_n = data_processor.drop_categorical_columns()
        return inputs_encoded, mappings, inputs_n

    def split_data(self, inputs_n, target):
        """
        Splits the dataset into training and testing subsets.

        Parameters:
        -----------
        inputs_n : pd.DataFrame
            The feature set after dropping categorical columns.

        target : pd.Series
            The target variable.

        Returns:
        --------
        tuple or None : (x_train, x_test, y_train, y_test) or None
            Returns a tuple of the training and testing sets, or None if splitting fails.
        """
        data_splitter = SafeSplitter(self.test_size, self.random_state)
        return data_splitter.train_test_split(inputs_n, target)

    def perform_grid_search(self, x_train, y_train):
        """
        Performs a grid search to find the best model based on hyperparameter tuning.

        Parameters:
        -----------
        x_train : pd.DataFrame
            The training feature set.

        y_train : pd.Series
            The training target variable.

        Returns:
        --------
        model or None : The best model after grid search or None if search fails.
        """
        grid_searcher = SafeGridSearch()
        return grid_searcher.perform_search(x_train, y_train)

    def evaluate_fairness(self, y_test, y_pred, sensitive_features):
        """
        Evaluates the fairness of the model predictions with respect to sensitive features.

        Parameters:
        -----------
        y_test : pd.Series
            The true labels for the test set.

        y_pred : np.array
            The predicted labels for the test set.

        sensitive_features : pd.DataFrame
            The sensitive feature columns to evaluate fairness.

        Returns:
        --------
        metric_frame : DataFrame
            A DataFrame containing fairness metrics.
        """
        fairness_evaluator = FairnessEvaluator(y_test, y_pred, sensitive_features)
        return fairness_evaluator.evaluate_fairness()

    def save_model(self, best_clf, x_test, y_test):
        """
        Saves the trained model and its accuracy score.

        Parameters:
        -----------
        best_clf : estimator
            The trained model.

        x_test : pd.DataFrame
            The test feature set.

        y_test : pd.Series
            The test target variable.
        """
        modelsaver = ModelSaver(best_clf, x_test, y_test)
        modelsaver.save_model()

    def create_data_points(self, feature1, mappings, metric_frame, inputs_n, file_reader):
        """
        Creates a list of data points for visualization based on the fairness evaluation.

        Parameters:
        -----------
        feature1 : str
            The first sensitive feature.

        mappings : dict
            A dictionary of mappings for encoding.

        metric_frame : DataFrame
            A DataFrame containing fairness metrics.

        inputs_n : pd.DataFrame
            The feature set after dropping categorical columns.

        file_reader : FileReader
            The file reader used to check for single-column data.

        Returns:
        --------
        data_point_list : list
            A list of data points to be displayed by the graphs.
        """
        if file_reader.single_column_check:
            dp_processor = SingleFeatureDataPointCreator(feature1, mappings, metric_frame)
        else:
            dp_processor = MultiFeatureDataPointCreator(feature1, mappings, metric_frame, inputs_n)

        data_point_list = dp_processor.data_point_list()
        return model_util.clean_datapoints(file_reader, data_point_list)

    def train_and_evaluate(self):
        """
        The main function that calls all other methods to train a model, evaluate fairness,
        and return results for visualization.

        Returns:
        --------
        data_point_list : list
            A list of cleaned data points to be displayed by graphs.
            Returns an empty list if there aren't enough samples or if grid search fails.
        """
        # Load and preprocess data
        data_tuple, file_reader = self.load_and_preprocess_data()
        df_dropped, inputs, target = data_tuple

        # Encode data
        inputs_encoded, mappings, inputs_n = self.encode_data(inputs)

        # Split data
        split_data = self.split_data(inputs_n, target)
        if split_data is None:
            return []  # Early exit if there aren't enough samples

        x_train, x_test, y_train, y_test = split_data

        # Perform grid search for hyperparameter tuning
        best_clf = self.perform_grid_search(x_train, y_train)
        if best_clf is None:
            return None  # Early exit if grid search fails

        # Make predictions
        y_pred = best_clf.predict(x_test)

        # Handle sensitive features for fairness evaluation
        feature1 = inputs_n.columns[0]
        sensitive_features = (
            x_test[[feature1]]
            if file_reader.single_column_check
            else x_test[[feature1, inputs_n.columns[1]]]
        )

        # Evaluate fairness
        metric_frame = self.evaluate_fairness(y_test, y_pred, sensitive_features)

        # Save the model
        self.save_model(best_clf, x_test, y_test)

        # Create, clean, and sort bias dictionary
        data_point_list = self.create_data_points(feature1, mappings, metric_frame, inputs_n, file_reader)

        return data_point_list
