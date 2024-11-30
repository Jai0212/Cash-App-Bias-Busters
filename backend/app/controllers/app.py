import os
import pickle

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from ml_model.use_cases.multiple_model_use import EvaluateModelsUseCase

from backend.app.entities import User
from backend.app.repositories import CsvFileRepo, SqliteDbRepo, UserRepo
from backend.app.use_cases import (
    ChangePasswordInteractor,
    Generate,
    GetHeaders,
    GetLastLoginData,
    GetValuesUnderHeader,
    LoginUserInteractor,
    RegisterUserInteractor,
    Share,
    UploadData,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

user = User("")
curr_dir = os.path.dirname(__file__)
file_path = os.path.join(curr_dir, "../../../database/output.csv")

db_repo = SqliteDbRepo(user)
file_repo = CsvFileRepo(user, file_path)


def initialize(curr_user: str) -> None:
    global db_repo
    global file_repo
    global user

    user = User(curr_user)

    db_repo.user = user
    db_repo.table_name = user.table_name

    file_repo.user = user
    file_repo.table_name = user.table_name
    file_repo.db_repo = SqliteDbRepo(user)


@app.route("/api/headers", methods=["POST"])
def headers():
    data = request.get_json()
    curr_user = data.get("curr_user")

    initialize(curr_user)

    if user.table_name:
        return jsonify(GetHeaders(file_repo).execute())
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/values-under-header", methods=["POST"])
def values_under_header():
    data = request.get_json()
    curr_user = data.get("curr_user")
    header = data.get("header")

    initialize(curr_user)

    if header and user.table_name:
        new_file_repo = CsvFileRepo(user, file_path)
        get_values_under_header = GetValuesUnderHeader(new_file_repo)
        values = get_values_under_header.execute(header)

        return jsonify(sorted(values))
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    curr_user = data.get("curr_user")
    demographics = data.get("demographics")
    choices = data.get("choices")
    time = data.get("time", None)

    initialize(curr_user)

    print("Generating Data received: ", demographics, choices, time)

    if demographics and choices and user.table_name:
        if demographics[0] == "":
            return jsonify({"error": "Missing required data."}), 400

        first_demographic = [
            element
            for element in list(set(choices.get(demographics[0], [])))
            if element != ""
        ]
        second_demographic = [
            element
            for element in list(set(choices.get(demographics[1], [])))
            if element != ""
        ]

        if demographics[0] == "" or len(first_demographic) == 0:
            return jsonify({"error": "Missing required data."}), 400
        if demographics[1] == "" or len(second_demographic) == 0:
            del choices[demographics[1]]
            demographics.pop()

        demographics = list(set(demographics))

        print("Generating data for: ", demographics, choices, time)

        data_points = Generate(file_repo, db_repo).execute(demographics, choices, time)

        data_points_dict = [
            {
                "feature1": dp.get_feature1(),
                "feature2": dp.get_feature2(),
                "accuracy": dp.get_accuracy(),
                "falsepositive": dp.get_false_positive_rate(),
                "falsenegative": dp.get_false_negative_rate(),
                "combination_label": dp.get_combination_label(),
            }
            for dp in data_points
        ]

        return jsonify(data_points_dict)

    return jsonify({"error": "Missing required data."}), 400


@app.route("/api/get-prev-data", methods=["POST"])
def get_prev_data():
    data = request.get_json()
    curr_user = data.get("curr_user")

    initialize(curr_user)

    if user.table_name:
        demographics, choices, time = GetLastLoginData(db_repo).execute()
        if demographics and choices and time:
            demographics.append("")
            demographics = demographics[0:2]

            choices[demographics[0]] = choices.get(demographics[0], []) + [
                "",
                "",
                "",
                "",
            ]
            choices[demographics[1]] = choices.get(demographics[1], []) + [
                "",
                "",
                "",
                "",
            ]

            choices[demographics[0]] = choices.get(demographics[0], [])[0:4]
            choices[demographics[1]] = choices.get(demographics[1], [])[0:4]

            return jsonify(
                {
                    "demographics": demographics,
                    "choices": choices,
                    "time": time,
                }
            )
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/upload-data", methods=["POST"])
def upload_data():
    """Upload data to the database."""
    csv_to_read = request.files.get("csv_to_read")
    curr_user = request.form.get("curr_user")

    initialize(curr_user)

    if not user.table_name or not csv_to_read:
        return jsonify({"error": "Missing required data."}), 400

    if UploadData(file_repo).execute(csv_to_read):
        return jsonify({"message": "Data uploaded successfully."}), 200
    else:
        return jsonify({"error": "Error uploading data."}), 500


UPLOAD_FOLDER = "uploads/"  # Directory to save uploaded models
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock database (in-memory for this example)
user_models = {}


@app.route("/api/upload-model", methods=["POST"])
def upload_model():
    file = request.files.get("model_file")
    dashboard = request.form.get("dashboard")
    curr_user = request.form.get("curr_user")

    initialize(curr_user)

    if not user.table_name or not file:
        return jsonify({"error": "Missing required data."}), 400

    if file and file.filename.endswith(".pkl"):
        # Create a directory for the user if it doesn't exist
        user_folder = os.path.join(UPLOAD_FOLDER, user.table_name)
        os.makedirs(
            user_folder, exist_ok=True
        )  # Create user folder if it doesn't exist

        if dashboard == "secret_token":
            fixed_filename = "model.pkl"
        else:
            fixed_filename = dashboard

        file_path = os.path.join(user_folder, fixed_filename)

        print("uploaded model file: ", file_path)

        file.save(file_path)

        # Save model path to "database"
        user_models[user.table_name] = file_path
        return jsonify({"message": "Model uploaded successfully."}), 200
    else:
        return jsonify({"error": "Invalid file format."}), 400


@app.route("/api/generate-for-all-models", methods=["POST"])
def generate_for_all_models():
    try:
        curr_user = request.form.get("curr_user")

        initialize(curr_user)

        if not user.table_name:
            return (
                jsonify({"error": "No current user found"}),
                400,
            )  # Return error if no user is provided

        models = get_files_in_folder(curr_user)
        for i in range(len(models)):
            models[i] = os.path.join(UPLOAD_FOLDER, curr_user, models[i])
        print("Multiple Models Paths:", models)

        new_file_repo = CsvFileRepo(User("SECRET_KEY"), file_path)

        evaluator = EvaluateModelsUseCase(new_file_repo, models)
        output = evaluator.execute()

        print("Multiple Models Output", output)

        output_filtered = []

        for _, value in output.items():
            output_filtered.append(value)

        print("Filtered Multiple Models Output", output_filtered)

        return jsonify(output_filtered)

    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            500,
        )  # Handle any unexpected errors and return 500


@app.route("/api/delete-model", methods=["POST"])
def delete_model():
    data = request.get_json()
    curr_user = data.get("curr_user")
    file_name = data.get("file_name")

    if not curr_user or not file_name:
        return (
            jsonify({"error": "Missing required fields: curr_user or file_name"}),
            400,
        )

    initialize(curr_user)

    if not user.table_name:
        return jsonify({"error": "No current user found"}), 400

    path = os.path.join(UPLOAD_FOLDER, curr_user, file_name)

    try:
        if os.path.exists(path):
            os.remove(path)
            print(f"Deleted: {file_name}")
            return jsonify({"message": f"Successfully deleted {file_name}"}), 200
        else:
            return jsonify({"error": f"The file {file_name} does not exist"}), 404
    except Exception as e:
        print(f"Error occurred while deleting model file: {e}")
        return jsonify({"error": "Error during file deletion"}), 500


def get_files_in_folder(user_folder: str):
    """
    Get all files in the user's folder, excluding "model.pkl".
    """
    path = os.path.join(UPLOAD_FOLDER, user_folder)

    try:
        # Check if the user folder exists
        if os.path.exists(path):
            # List all files in the folder
            files_in_folder = os.listdir(path)

            # Remove "model.pkl" from the list if it exists
            if "model.pkl" in files_in_folder:
                files_in_folder.remove("model.pkl")

            return files_in_folder
        else:
            print(f"The folder {path} does not exist.")
            return []
    except Exception as e:
        print(f"Error occurred while getting files: {e}")
        return []


def delete_files_except_model(user_folder: str):
    """
    Delete all files in the user's folder except the file named "model.pkl" if it exists.
    """
    if not user_folder:
        print("No user provided in delete_files_except_model.")
        return

    print(f"Deleting files in folder: {UPLOAD_FOLDER + user_folder}")
    path = os.path.join(UPLOAD_FOLDER, user_folder)

    try:
        # Check if the user folder exists
        if os.path.exists(path):
            # List all files in the folder
            files_in_folder = os.listdir(path)

            # Loop through the files
            for file_name in files_in_folder:
                file_path = os.path.join(path, file_name)

                # Skip deletion if the file is 'model.pkl'
                if file_name != "model.pkl" and os.path.isfile(file_path):
                    os.remove(file_path)  # Delete the file
                    print(f"Deleted: {file_name}")
                else:
                    print(f"Skipped: {file_name}")
        else:
            print(f"The folder {path} does not exist.")
    except Exception as e:
        print(f"Error occurred while deleting files: {e}")


def load_model(curr_user: str):
    model_path = os.path.join(UPLOAD_FOLDER, curr_user, "model.pkl")

    # Check if the model file exists
    if os.path.exists(model_path):
        with open(model_path, "rb") as file:
            model = pickle.load(file)
        return model
    else:
        print("Model not found.")
        return None


@app.route("/")
def home():
    return "Welcome to the Backend!"


user_repo = UserRepo(table_name="users")


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    print("Received data:", data)

    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    # Validate required fields and password confirmation
    if password != confirm_password:
        return (
            jsonify({"code": 2, "error": True, "message": "Passwords do not match"}),
            400,
        )

    if (
        not firstname
        or not lastname
        or not email
        or not password
        or not confirm_password
    ):
        return (
            jsonify({"code": 2, "error": True, "message": "All fields are required"}),
            400,
        )

    try:

        # Use the `RegisterUserInteractor` with the repository
        register_interactor = RegisterUserInteractor(user_repo)
        response = register_interactor.execute(firstname, lastname, email, password)
        return jsonify({"code": 3, "error": False, "message": response["message"]}), 201

    except ValueError as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 400

    except Exception as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 500


current_user_email = None


@app.route("/login", methods=["POST"])
def login():
    global current_user_email

    data = request.get_json()
    print("Received data:", data)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return (
            jsonify(
                {"code": 2, "error": True, "message": "Email and Password are required"}
            ),
            400,
        )

    try:
        # Use the LoginUserInteractor with the UserRepository
        login_interactor = LoginUserInteractor(user_repo)
        response = login_interactor.execute(email, password)

        # Store the email globally if login is successful
        current_user_email = email
        print(f"Current logged-in user: {current_user_email}")

        return jsonify({"code": 3, "error": False, "message": response["message"]}), 200

    except ValueError as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 401

    except Exception as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 500


@app.route("/logout", methods=["POST"])
def logout():
    global current_user_email

    delete_files_except_model(current_user_email)

    current_user_email = None

    print("User logged out, current_user_email reset to None.")
    return jsonify({"error": False, "message": "Logged out successfully."}), 200


@app.route("/get-email", methods=["GET"])
def get_email():
    global current_user_email
    if current_user_email is None:
        return jsonify({"error": True, "message": "No user is logged in."}), 401
    return jsonify({"email": current_user_email}), 200


@app.route("/change_password", methods=["POST"])
def change_password():
    global current_user_email

    data = request.get_json()
    print("Received data:", data)

    email = current_user_email
    old_password = data.get("old_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not email or not old_password or not new_password or not confirm_password:
        return (
            jsonify({"code": 2, "error": True, "message": "All fields are required"}),
            400,
        )

    if new_password != confirm_password:
        return (
            jsonify(
                {
                    "code": 2,
                    "error": True,
                    "message": "New password and confirm password do not match",
                }
            ),
            400,
        )

    try:
        # Use the ChangePasswordInteractor with the UserRepository
        change_password_interactor = ChangePasswordInteractor(user_repo)
        response = change_password_interactor.execute(email, old_password, new_password)

        return jsonify({"code": 3, "error": False, "message": response["message"]}), 200

    except ValueError as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 400

    except Exception as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 500


@app.route("/share/<encoded_data>", methods=["GET"])
def share(encoded_data):
    try:
        sharer = Share(user_repo, encoded_data)
        data = sharer.execute()

        initialize(data.get("currUser"))

        demographics = [
            data.get("selectedDemographic"),
            data.get("secondSelectedDemographic"),
        ]
        choices = {
            demographics[0]: data.get("selectedValues"),
            demographics[1]: data.get("selectedSecondValues"),
        }
        time = data.get("timeframe")

        data_points = Generate(file_repo, db_repo).execute(demographics, choices, time)

        data_points_dict = [
            {
                "feature1": dp.get_feature1(),
                "feature2": dp.get_feature2(),
                "accuracy": dp.get_accuracy(),
                "falsepositive": dp.get_false_positive_rate(),
                "falsenegative": dp.get_false_negative_rate(),
                "combination_label": dp.get_combination_label(),
            }
            for dp in data_points
        ]

        combined_data = {"graph_data": data_points_dict, "other_data": data}

        return jsonify(combined_data)

    except Exception as e:
        return (
            jsonify({"error": "Failed to decode or parse data", "message": str(e)}),
            400,
        )


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
