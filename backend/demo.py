import os
from app.entities import User
from app.use_cases import (
    Generate,
    GetHeaders,
    GetLastLoginData,
    GetValuesUnderHeader,
    UploadData,
)
from app.repositories import SqliteDbRepo, CsvFileRepo

curr_dir = os.path.dirname(__file__)
file_path = os.path.join(curr_dir, "../database/output.csv")

user = User("jj@gmail.com")

db_repo = SqliteDbRepo(user)
file_repo = CsvFileRepo(user, file_path)

# get_headers_use_case = GetHeaders(file_repo)
# print("Table headers:", get_headers_use_case.execute())

# curr_dir = os.path.dirname(__file__)
# file_path = os.path.join(curr_dir, "../database/test.csv")
# upload_data = UploadData(file_repo)
# print(upload_data.execute(file_path))

# get_values_under_header = GetValuesUnderHeader(file_repo)
# print(get_values_under_header.execute("race"))

# get_last_login_data = GetLastLoginData(db_repo)
# print(get_last_login_data.execute())

# demographics = ["gender", "race"]
# choices = {
#     "gender": ["Non-binary", "Male", "Female", ""],
#     "race": ["Black", "Other", "Hispanic", ""],
# }
demographics = ["gender", ""]
choices = {
    "gender": ["Non-binary", "Male", "Female", ""],
}
time = "year"
# file_repo.update_comparison_csv(demographics, choices, time)

# generate = Generate(file_repo, db_repo)
# result = generate.execute(demographics, choices, time)
# print(len(result))
# for i in result:
#     print(
#         i.get_feature1(),
#         i.get_feature2(),
#         i.get_accuracy(),
#         i.get_false_positive_rate(),
#         i.get_false_negative_rate(),
#         i.get_combination_label(),
#     )
