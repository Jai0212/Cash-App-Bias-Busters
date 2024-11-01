from typing import Any
import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn import tree
from sklearn.model_selection import train_test_split
from sklearn.model_selection import GridSearchCV


def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series): # type: ignore
    df = pd.read_csv('../../database/output.csv')

    bins = range(18, 61, 10)

    # Create labels for each bin
    labels = [f"{i}-{i + 4}" for i in bins[:-1]]

    # Use cut to create a new column with age groups
    df['age_groups'] = pd.cut(df['age'], bins=bins, labels=labels, right=False)
    df_dropped = df.drop('age', axis=1)
    print(df_dropped)

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
<<<<<<< HEAD
    X_train, X_test, y_train, y_test = train_test_split(inputs, target, test_size=0.2, random_state=None)
=======
    X_train, X_test, y_train, y_test = train_test_split(inputs, target, test_size=0.6, random_state=100)
>>>>>>> 550560bf8a56d5290f441154bec76174bcb21a74

    # Initialize and train the model
    clf = tree.DecisionTreeClassifier()
    clf.fit(X_train, y_train)

    score = clf.score(X_test, y_test)

    with open("model_with_score.pkl", "wb") as f:
        pickle.dump({'model': clf, 'score': score}, f)

    # Return the model score on the test set
    return clf.score(X_test, y_test)

print(model())
