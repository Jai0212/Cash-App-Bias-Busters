import os
import sys
from app.repositories.interfaces import (
    FileRepositoryInterface,
    DatabaseRepositoryInterface,
)

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)

from ml_model.use_cases.model import model


class Generate:
    """
    A class used to represent the Generate use case.

    Methods
    -------
    __init__(file_repo: FileRepositoryInterface, db_repo: DatabaseRepositoryInterface)
        Initializes the Generate use case with file and database repositories.

    execute(demographics: list[str], choices: dict[str, list[str]], time: str) -> None
        Executes the generate use case by updating the comparison CSV and database,
        then processes the output from the model and prints the results.
    """

    def __init__(
        self, file_repo: FileRepositoryInterface, db_repo: DatabaseRepositoryInterface
    ):
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
