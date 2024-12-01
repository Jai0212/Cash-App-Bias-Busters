import os
import pickle
import pandas as pd
from sklearn.model_selection import GridSearchCV


class ModelSaver:
    """
            Saves the trained model and its evaluation score as a pickle (.pkl) file.

            Parameters:
            -----------
            best_clf : GridSearchCV
                The trained model object, which is an instance of GridSearchCV containing the best estimator after hyperparameter tuning.

            x_test : pd.DataFrame
                The test dataset features used for evaluating the model.

            y_test : pd.Series
                The actual labels corresponding to the test dataset.

            Returns:
            --------
            None
                The function saves the model and its score to a file named `model_with_score.pkl` in the parent directory of the current script location.
    """
    def __init__(self, best_clf: GridSearchCV, x_test: pd.DataFrame, y_test: pd.Series):
        """
        Initializes the ModelSaver class with model, test features, and test labels.

        Parameters:
        -----------
        best_clf : GridSearchCV
            The trained model object, which is an instance of GridSearchCV containing the best estimator after hyperparameter tuning.

        x_test : pd.DataFrame
            The test dataset features used for evaluating the model.

        y_test : pd.Series
            The actual labels corresponding to the test dataset.
        """
        self.best_clf = best_clf
        self.x_test = x_test
        self.y_test = y_test

    def save_model(self) -> None:
        """
        Saves the trained model and its evaluation score as a pickle (.pkl) file.

        Returns:
        --------
        None
            The function saves the model and its score to a file named `model_with_score.pkl` in the parent directory of the current script location.

        Notes:
        ------
        - The `score` is calculated using the `score` method of the `best_clf` object, which typically represents accuracy for classification models.
        - The resulting pickle file contains a dictionary with two keys:
            - "model": the `best_clf` object.
            - "score": the evaluation score of the model on the test data.
        """
        # Overall model score
        score = self.best_clf.score(self.x_test, self.y_test)

        curr_dir = os.path.dirname(__file__)
        model_path = os.path.join(curr_dir, "../model_with_score.pkl")

        # Save the model and its score
        with open(model_path, "wb") as f:
            pickle.dump({"model": self.best_clf, "score": score}, f)

        return
