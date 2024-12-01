from sklearn.model_selection import train_test_split
import pandas as pd


class SafeSplitter:
    """
    A class for safely splitting datasets into training and testing subsets.

    This class ensures that a dataset is properly split while handling cases
    where the sample size is too small to perform the split.
    """

    @staticmethod
    def train_test_split(inputs: pd.DataFrame, target: pd.Series, test_size=0.2, random_state=48):
        """
        Splits the dataset into training and testing subsets safely.

        Parameters:
        -----------
        inputs : pd.DataFrame
            Feature set of the dataset.

        target : pd.Series
            Target labels of the dataset.

        test_size : float, optional (default=0.2)
            Proportion of the dataset to include in the test split.

        random_state : int, optional (default=48)
            Controls the shuffling applied to the data before splitting.

        Returns:
        --------
        tuple or None
            Returns a tuple (x_train, x_test, y_train, y_test) if the split is successful.
            Returns None if there are not enough samples to split.
        """
        try:
            x_train, x_test, y_train, y_test = train_test_split(
                inputs, target, test_size=test_size, random_state=random_state
            )
            return x_train, x_test, y_train, y_test
        except ValueError as e:
            if "With n_samples=" in str(e):
                print("Not enough samples to split. Returning None.")
                return None
