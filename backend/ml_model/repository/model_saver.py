from sklearn.model_selection import GridSearchCV
import pandas as pd
import pickle
import os


def save_model(best_clf: GridSearchCV,
               x_test: pd.DataFrame,
               y_test: pd.Series) -> None:
    """
    Saves the model as a pkl file
    """
    # Overall model score
    score = best_clf.score(x_test, y_test)

    curr_dir = os.path.dirname(__file__)
    model_path = os.path.join(curr_dir, "../model_with_score.pkl")

    # Save the model and its score
    with open(model_path, "wb") as f:
        pickle.dump({"model": best_clf, "score": score}, f)

    return
