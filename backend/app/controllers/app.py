import pickle
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from app.entities import User
from app.use_cases import (
    Generate,
    GetHeaders,
    GetLastLoginData,
    GetValuesUnderHeader,
    UploadData,
)
from app.repositories import SqliteDbRepo, CsvFileRepo
from app.use_cases.user_interactor import (
    register_user_interactor,
    login_user_interactor,
    change_password_interactor,
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

        data_points = Generate(file_repo, db_repo).execute(
            demographics, choices, time
        )  # TODO add akshat and armagan function to this

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

        return jsonify(data_points_dict)  # TODO this needs to be updated in frontend

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
        print(models)

        temporary_output = [
            [
                {
                    "race": 0.33,
                    "gender": 0.55,
                    "age": 0.62,
                    "state": 0.2,
                    "variance": 0.2,
                    "mean": 0.4,
                },
                {
                    "race": 0.45,
                    "gender": 0.60,
                    "age": 0.72,
                    "state": 0.3,
                    "variance": 0.25,
                    "mean": 0.45,
                },
                {
                    "race": 0.29,
                    "gender": 0.53,
                    "age": 0.68,
                    "state": 0.25,
                    "variance": 0.15,
                    "mean": 0.35,
                },
                {
                    "race": 0.50,
                    "gender": 0.48,
                    "age": 0.70,
                    "state": 0.18,
                    "variance": 0.22,
                    "mean": 0.42,
                },
                {
                    "race": 0.40,
                    "gender": 0.58,
                    "age": 0.65,
                    "state": 0.22,
                    "variance": 0.18,
                    "mean": 0.38,
                },
            ]
        ]

        return jsonify(temporary_output)

    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            500,
        )  # Handle any unexpected errors and return 500

    # TODO add akshat and armagan function to this and return the output


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


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    print("Received data:", data)
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")
    print(email)

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
        response = register_user_interactor(firstname, lastname, email, password)
        return jsonify({"code": 3, "error": False, "message": response["message"]}), 201

    except ValueError as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 400

    except Exception as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 500


current_user_email = None


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    print(data)
    email = data.get("email")
    password = data.get("password")

    try:
        response = login_user_interactor(email, password)
        if not response.get("error"):
            # Store the email in the global variable only if login is successful
            global current_user_email
            current_user_email = email
            print(current_user_email)

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
        response = change_password_interactor(email, old_password, new_password)
        return jsonify({"code": 3, "error": False, "message": response["message"]}), 200
    except ValueError as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"code": 2, "error": True, "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
