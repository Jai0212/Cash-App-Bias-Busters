from typing import Any, Dict, List, Tuple
import math

import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn import tree
from sklearn.model_selection import train_test_split, GridSearchCV
from fairlearn.metrics import MetricFrame


def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series):  # type: ignore
    df = pd.read_csv('../../database/output.csv')

    # Check if the DataFrame has only one column
    if df.shape[1] == 1:
        single_column_check = True

    # Check if 'age' column exists
    if 'age' in df.columns:
        bins = range(18, 90, 9)

        # Create labels for each bin CHANGED THIS
        labels = [f"{i}-{i + 8}" for i in bins[:-1]]

        # Use cut to create a new column with age groups
        df['age_groups'] = pd.cut(df['age'], bins=bins, labels=labels, right=False)
    else:
        df['age_groups'] = None  # or you can choose to drop the age_groups column later if you want

    df_dropped = df.drop('age', axis=1, errors='ignore')  # This will ignore the error if 'age' does not exist

    inputs = df_dropped.drop('is_biased', axis='columns', errors='ignore')  # Ignore error if 'is_biased' does not exist
    target = df_dropped.get('is_biased', pd.Series())  # Get 'is_biased' or an empty Series if it does not exist

    return df_dropped, inputs, target


def labels_encoder():
    le_gender = LabelEncoder()
    le_age = LabelEncoder()
    le_race = LabelEncoder()
    le_state = LabelEncoder()

    _, inputs, _ = file_reader()

    inputs["gender_N"] = le_gender.fit_transform(inputs['gender'])
    inputs["age_N"] = le_age.fit_transform(inputs['age_groups'])
    inputs["race_N"] = le_race.fit_transform(inputs['race'])
    inputs["state_N"] = le_state.fit_transform(inputs['state'])

    # Get mapping from numeric codes back to labels
    age_mapping = dict(zip(le_age.transform(le_age.classes_), le_age.classes_))
    race_mapping = dict(zip(le_race.transform(le_race.classes_), le_race.classes_))
    gender_mapping = dict(zip(le_gender.transform(le_gender.classes_), le_gender.classes_))
    state_mapping = dict(zip(le_state.transform(le_state.classes_), le_state.classes_))

    inputs_n = inputs.drop(['gender', 'age_groups', 'race', 'state', 'id', 'timestamp'], axis='columns')
    return inputs_n, age_mapping, race_mapping, gender_mapping, state_mapping


def model() -> dict:
    inputs, age_m, race_m, gender_m, state_m = labels_encoder()
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
    sensitive_features = X_test[['race_N', 'age_N']]  # Add your sensitive features here

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

    # Create dictionary with mapped keys
    bias_dictionary = {}
    for (race_code, age_code), metrics in metric_frame.by_group.iterrows():
        race_label = race_m.get(race_code, "Unknown Race")
        age_label = age_m.get(age_code, "Unknown Age")
        key = (str(race_label), str(age_label))  # Ensuring keys are strings for sorting

        bias_dictionary[key] = [
            round(metrics['accuracy'], 3),
            round(metrics['false_positive_rate'], 3),
            round(metrics['false_negative_rate'], 3)
        ]

    # Cleaned dictionary without NaN values
    cleaned_bias_dictionary = {k: v for k, v in bias_dictionary.items() if not any(math.isnan(x) for x in v)}

    # Sort dictionary by race_label and then by age_label
    sorted_bias_dictionary = dict(sorted(cleaned_bias_dictionary.items(), key=lambda item: (item[0][0], item[0][1])))

    return sorted_bias_dictionary

# Execute the model function and print the score
print(model())
