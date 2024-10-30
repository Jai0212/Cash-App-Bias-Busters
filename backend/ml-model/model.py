from typing import Any
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn import tree

def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.DataFrame): # type: ignore

    df = pd.read_csv('database/output.csv')
    inputs = df. drop('is_biased', axis='columns')
    target = df['is_biased']
    return df, inputs, target


def labels_encoder() -> Any:
    le_gender = LabelEncoder()
    le_age = LabelEncoder()
    le_race = LabelEncoder()
    le_state = LabelEncoder()

    _, inputs, _ = file_reader()

    inputs["gender_N"] = le_gender.fit_transform(inputs['gender'])
    inputs["age_N"] = le_age.fit_transform(inputs['age'])
    inputs["race_N"] = le_race.fit_transform(inputs['race'])
    inputs["state_N"] = le_state.fit_transform(inputs['state'])

    inputs_n = inputs.drop(['gender', 'age', 'race', 'state', 'id', 'timestamp'], axis='columns')
    return inputs_n

def model() -> float:
    model = tree.DecisionTreeClassifier()
    _, _, target = file_reader()
    model.fit(labels_encoder(), target)
    return model.score(labels_encoder(), target)

print(model())