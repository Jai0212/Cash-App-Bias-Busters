from typing import Any
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn import tree
from sklearn.model_selection import train_test_split

def file_reader() -> (pd.DataFrame, pd.DataFrame, pd.Series): # type: ignore
    df = pd.read_csv('database/output.csv')
    inputs = df.drop('is_biased', axis='columns')
    target = df['is_biased']
    return df, inputs, target

def labels_encoder() -> pd.DataFrame:
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
    inputs = labels_encoder()
    _, _, target = file_reader()
    
    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(inputs, target, test_size=0.2, random_state=42)
    
    # Initialize and train the model
    clf = tree.DecisionTreeClassifier()
    clf.fit(X_train, y_train)
    
    # Return the model score on the test set
    return clf.score(X_test, y_test)

print(model())