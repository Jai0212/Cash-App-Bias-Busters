import os
import sys
from app.repositories.interfaces import FileRepository, DatabaseRepository

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)

from ml_model.use_cases.model import model


class Generate:
    def __init__(self, file_repo: FileRepository, db_repo: DatabaseRepository):
        self.file_repo = file_repo
        self.db_repo = db_repo

    def execute(
        self, demographics: list[str], choices: dict[str, list[str]], time: str
    ) -> None:
        self.file_repo.update_comparison_csv(demographics, choices, time)
        self.db_repo.update_db_for_user(demographics, choices, time)
        print("GENERATE:", demographics, choices, time)
        output = model()

        if output is None:
            output = []

        new_output = []
        for i in output:
            new_output.append(
                {
                    "feature1": i.get_feature1(),
                    "feature2": i.get_feature2(),
                    "accuracy": 1 - i.get_accuracy(),
                    "false_positive_rate": i.get_false_positive_rate(),
                    "false_negative_rate": i.get_false_negative_rate(),
                    "combination_label": i.get_combination_label(),
                }
            )

        print(output)
        return output
