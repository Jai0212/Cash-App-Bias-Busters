from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.tree import DecisionTreeClassifier


def safe_train_test_split(inputs, target, test_size=0.2, random_state=48):
    try:
        x_train, x_test, y_train, y_test = train_test_split(
            inputs, target, test_size=test_size, random_state=random_state
        )
        return x_train, x_test, y_train, y_test
    except ValueError as e:
        if "With n_samples=" in str(e):
            print("Not enough samples to split. Returning None.")
            return None  # Returning None when there aren't enough samples


def safe_grid_search(x_train, y_train):
    try:
        # Perform grid search
        clf = DecisionTreeClassifier()
        param_grid = {
            "criterion": ["gini", "entropy"],
            "max_depth": [None] + list(range(1, 11)),
            "min_samples_split": [2, 5, 10],
        }
        grid_search = GridSearchCV(clf, param_grid, cv=5, scoring="accuracy")
        grid_search.fit(x_train, y_train)
        return grid_search.best_estimator_
    except ValueError as e:
        if "Cannot have number of splits n_splits" in str(e):
            print("Not enough samples for cross-validation. Returning None.")
            return None  # Returning None when there aren't enough samples
