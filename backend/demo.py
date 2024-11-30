import os

from backend.ml_model.use_cases.multiple_model_use import EvaluateModelsUseCase

from backend.app.entities import User
from backend.app.repositories import CsvFileRepo, SqliteDbRepo
from backend.app.use_cases import (
    Generate,
    GetHeaders,
    GetLastLoginData,
    GetValuesUnderHeader,
    UploadData,
)

curr_dir = os.path.dirname(__file__)
file_path = os.path.join(curr_dir, "../database/output.csv")

user = User("ff@gmail.com")

db_repo = SqliteDbRepo(user)
file_repo = CsvFileRepo(user, file_path)

# ------------------------ SECRET KEY ------------------------
# new_path = os.path.join(curr_dir, "../database/full_single_transaction.csv")
# secret_file_repo = CsvFileRepo(User("SECRET_KEY"), file_path)
# secret_file_repo.import_csv_to_db(new_path)

# secret_db_repo = SqliteDbRepo(User("SECRET_KEY"))
# secret_db_repo.fetch_data(True)

# secret_file_repo.save_data_to_csv()
# secret_file_repo.delete_csv_data()
# ------------------------------------------------------------

# get_headers_use_case = GetHeaders(file_repo)
# print("Table headers:", get_headers_use_case.execute())

# curr_dir = os.path.dirname(__file__)
# file_path = os.path.join(curr_dir, "../database/test.csv")
# upload_data = UploadData(file_repo)
# print(upload_data.execute(file_path))

# get_values_under_header = GetValuesUnderHeader(file_repo)
# print(get_values_under_header.execute("race"))
# evaluator = EvaluateModelsUseCase(
#     [os.path.join(curr_dir, "uploads/jj@gmail.com/model.pkl")]
# )
# eval_results = evaluator.execute()
# print(eval_results)
# get_last_login_data = GetLastLoginData(db_repo)
# print(get_last_login_data.execute())

demographics = ["race", "gender"]
choices = {
    "race": ["Black", "Other", "Hispanic", ""],
    "gender": ["Non-binary", "Male", "Female", ""],
}
# demographics = ["gender", ""]
# choices = {
#     "gender": ["Non-binary", "Male", "Female", ""],
# }
time = "year"
# file_repo.update_comparison_csv(demographics, choices, time)

generate = Generate(file_repo, db_repo)
result = generate.execute(demographics, choices, time)
print(len(result))
for i in result:
    print(
        i.get_feature1(),
        i.get_feature2(),
        i.get_accuracy(),
        i.get_false_positive_rate(),
        i.get_false_negative_rate(),
        i.get_combination_label(),
    )
