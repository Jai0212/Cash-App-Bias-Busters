import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn import tree
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame

def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series):  # type: ignore
    df = pd.read_csv('../../database/output.csv')

    bins = range(18, 61, 10)

    # Create labels for each bin
    labels = [f"{i}-{i + 4}" for i in bins[:-1]]

    # Use cut to create a new column with age groups
    df['age_groups'] = pd.cut(df['age'], bins=bins, labels=labels, right=False)
    df_dropped = df.drop('age', axis=1)

    inputs = df_dropped.drop('is_biased', axis='columns')
    target = df_dropped['is_biased']

    return df_dropped, inputs, target


def labels_encoder() -> pd.DataFrame:
    le_gender = LabelEncoder()
    le_age = LabelEncoder()
    le_race = LabelEncoder()
    le_state = LabelEncoder()

    _, inputs, _ = file_reader()

    inputs["gender_N"] = le_gender.fit_transform(inputs['gender'])
    inputs["age_N"] = le_age.fit_transform(inputs['age_groups'])
    inputs["race_N"] = le_race.fit_transform(inputs['race'])
    inputs["state_N"] = le_state.fit_transform(inputs['state'])

    inputs_n = inputs.drop(['gender', 'age_groups', 'race', 'state', 'id', 'timestamp'], axis='columns')
    return inputs_n


def model() -> float:
    inputs = labels_encoder()
    _, _, target = file_reader()

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(inputs, target, test_size=0.2, random_state=48)

    # Define the model
    clf = tree.DecisionTreeClassifier()

    # Set up the parameter grid for hyperparameter tuning
    param_grid = {
        'criterion': ['gini', 'entropy'],
        'max_depth': [None] + list(range(1, 11)),  # Example depth values
        'min_samples_split': [2, 5, 10],
    }

    # Initialize GridSearchCV
    grid_search = GridSearchCV(clf, param_grid, cv=5, scoring='accuracy')

    # Fit the model
    grid_search.fit(X_train, y_train)

    # Get the best model from grid search
    best_clf = grid_search.best_estimator_

    # Get predictions
    y_pred = best_clf.predict(X_test)

    # Specify multiple sensitive features
    sensitive_features = X_test[['race_N']]  # Add your sensitive features here

    # Create a MetricFrame to evaluate fairness
    metric_frame = MetricFrame(
        metrics={
            'accuracy': lambda y_true, y_pred: np.mean(y_true == y_pred),
            'false_positive_rate': lambda y_true, y_pred: np.mean((y_true == 0) & (y_pred == 1)),
            'false_negative_rate': lambda y_true, y_pred: np.mean((y_true == 1) & (y_pred == 0)),
        },
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_features  # Pass the DataFrame with multiple sensitive features
    )

    # Print metrics for each group
    print(metric_frame.by_group)

    # Overall model score
    score = best_clf.score(X_test, y_test)

    # Save the model and its score
    with open("model_with_score.pkl", "wb") as f:
        pickle.dump({'model': best_clf, 'score': score}, f)

    # Return the model score on the test set
    return score

# Execute the model function and print the score
print(model())
