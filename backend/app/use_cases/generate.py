from app.repositories.interfaces import FileRepository, DatabaseRepository

class Generate:
    def __init__(self, file_repo: FileRepository, db_repo: DatabaseRepository):
        self.file_repo = file_repo
        self.db_repo = db_repo

    def execute(self, demographics: list[str], choices: dict[str, list[str]], time: str) -> None:
        self.file_repo.update_comparison_csv(demographics, choices, time)
        self.db_repo.update_db_for_user(demographics, choices, time)
        # TODO model() akshat armagan function call
