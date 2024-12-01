from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
import pandas as pd


class SafeGridSearch:
    """
    A utility class for safely performing grid search for hyperparameter tuning.

    This class ensures that grid search is executed while handling cases
    where there are insufficient samples for cross-validation.
    """

    def __init__(self, classifier=DecisionTreeClassifier(), param_grid=None):
        """
        Initializes the SafeGridSearch with a classifier and a parameter grid.

        Parameters:
        -----------
        classifier : estimator object, optional (default=DecisionTreeClassifier())
            The base classifier to use for grid search.

        param_grid : dict, optional
            The parameter grid to use for tuning hyperparameters. If None,
            a default parameter grid for DecisionTreeClassifier is used.
        """
        self.classifier = classifier
        self.param_grid = param_grid or {
            "criterion": ["gini", "entropy"],
            "max_depth": [None] + list(range(1, 11)),
            "min_samples_split": [2, 5, 10],
        }

    def perform_search(self, x_train: pd.DataFrame, y_train: pd.Series):
        """
        Performs a safe grid search for hyperparameter tuning.

        Parameters:
        -----------
        x_train : pd.DataFrame
            The training feature set.

        y_train : pd.Series
            The training labels.

        Returns:
        --------
        estimator or None
            Returns the best estimator if grid search is successful.
            Returns None if there are insufficient samples for cross-validation.
        """
        try:
            grid_search = GridSearchCV(self.classifier, self.param_grid, cv=5, scoring="accuracy")
            grid_search.fit(x_train, y_train)
            return grid_search.best_estimator_
        except ValueError as e:
            if "Cannot have number of splits n_splits" in str(e):
                print("Not enough samples for cross-validation. Returning None.")
                return None
