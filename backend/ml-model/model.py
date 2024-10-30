from typing import Any
import pandas as pd
from sklearn.preprocessing import LabelEncoder

def file_reader(csv: str) -> None:
    
    df = pd.read_csv("csv")
    inputs = df. drop('Is_Action_Biased', axis= 'columns')
    target = df['Is_Action_Biased']
    return df, inputs, target


def labels_encoder() -> Any:
le_gender = LabelEncoder()
le_age = LabelEncoder()
le_race = LabelEncoder()
le_state = LabelEncoder()

    _, inputs, _ = file_reader()

    inputs["Gender_N"] = le_gender.fit_transform(inputs['Gender'])
    inputs["Age_N"] = le_age.fit_transform(inputs['Age'])
    inputs["Race_N"] = le_race.fit_transform(inputs['Race'])
    inputs["State_N"] = le_state.fit_transform(inputs['State'])


    inputs_n = inputs.drop(['Gender', 'Age', 'Race', 'State'], axis='columns')
    return inputs_n
    
    inputs_n = inputs.drop(['Gender', 'Age', 'Race', 'State'], axis='columns')
    return inputs_n
