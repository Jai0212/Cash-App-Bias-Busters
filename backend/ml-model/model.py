import pandas as pd 
from sklearn.preprocessing import LabelEncoder

def file_reader(csv: str) -> None:
    
    df = pd.read_csv("csv")
    inputs = df. drop('Is_Action_Biased', axis= 'columns')
    target = df['Is_Action_Biased']


le_gender = LabelEncoder()
le_age = LabelEncoder()
le_race = LabelEncoder()
le_state = LabelEncoder()
