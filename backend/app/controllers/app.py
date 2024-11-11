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

load_dotenv()

app = Flask(__name__)
CORS(app)

user = User("")
curr_dir = os.path.dirname(__file__)
file_path = os.path.join(curr_dir, "../../../database/output.csv")

db_repo = SqliteDbRepo(user)
file_repo = CsvFileRepo(user, file_path)


@app.route("/api/set-curr-user", methods=["POST"])
def set_curr_user():
    data = request.get_json()
    curr_user = data.get("curr_user")

    user = User(curr_user)

    db_repo.user = user
    db_repo.table_name = user.table_name

    file_repo.user = user
    file_repo.table_name = user.table_name
    file_repo.db_repo = SqliteDbRepo(user)

    return jsonify({"message": "User set successfully."}), 200


@app.route("/api/headers", methods=["POST"])
def headers():
    if user.table_name:
        return jsonify(GetHeaders(file_repo).execute())
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/values-under-header", methods=["POST"])
def values_under_header():
    data = request.get_json()
    header = data.get("header")

    if header and user.table_name:
        values = GetValuesUnderHeader(file_repo).execute(header)
        return jsonify(values)
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    demographics = data.get("demographics")
    choices = data.get("choices")
    time = data.get("time", None)

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

    if not user.table_name or not file:
        return jsonify({"error": "Missing required data."}), 400

    if file and file.filename.endswith(".pkl"):
        # Create a directory for the user if it doesn't exist
        user_folder = os.path.join(UPLOAD_FOLDER, user.table_name)
        os.makedirs(
            user_folder, exist_ok=True
        )  # Create user folder if it doesn't exist

        if dashboard == "one":
            fixed_filename = "model.pkl"
        else:
            fixed_filename = f"{dashboard}.pkl"

        file_path = os.path.join(user_folder, fixed_filename)
        file.save(file_path)

        # Save model path to "database"
        user_models[user.table_name] = file_path
        return jsonify({"message": "Model uploaded successfully."}), 200
    else:
        return jsonify({"error": "Invalid file format."}), 400


@app.route("/api/generate-for-all-models", methods=["POST"])
def generate_for_all_models():
    models = get_files_in_folder(user.table_name)
    # TODO add akshat and armagan function to this and return the output


def get_files_in_folder(user_folder: str):
    """
    Get all files in the user's folder, excluding "model.pkl".
    """
    try:
        # Check if the user folder exists
        if os.path.exists(user_folder):
            # List all files in the folder
            files_in_folder = os.listdir(user_folder)

            # Remove "model.pkl" from the list if it exists
            if "model.pkl" in files_in_folder:
                files_in_folder.remove("model.pkl")

            return files_in_folder
        else:
            print(f"The folder {user_folder} does not exist.")
            return []
    except Exception as e:
        print(f"Error occurred while getting files: {e}")
        return []


def delete_files_except_model(user_folder: str):
    """
    Delete all files in the user's folder except the file named "model.pkl" if it exists.
    """
    try:
        # Check if the user folder exists
        if os.path.exists(user_folder):
            # List all files in the folder
            files_in_folder = os.listdir(user_folder)

            # Loop through the files
            for file_name in files_in_folder:
                file_path = os.path.join(user_folder, file_name)

                # Skip deletion if the file is 'model.pkl'
                if file_name != "model.pkl" and os.path.isfile(file_path):
                    os.remove(file_path)  # Delete the file
                    print(f"Deleted: {file_name}")
                else:
                    print(f"Skipped: {file_name}")
        else:
            print(f"The folder {user_folder} does not exist.")
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


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
