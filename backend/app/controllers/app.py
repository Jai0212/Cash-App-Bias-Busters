import os
import pickle
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
from ml_model.model import model

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

        output = Generate(file_repo, db_repo).execute(
            demographics, choices, time
        )  # TOOD add akshat and armagan function to this

        return jsonify({f"{key[0]}_{key[1]}": value for key, value in output.items()})

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

    if not user.table_name or not file:
        return jsonify({"error": "Missing required data."}), 400

    if file and file.filename.endswith(".pkl"):
        # Create a directory for the user if it doesn't exist
        user_folder = os.path.join(UPLOAD_FOLDER, user.table_name)
        os.makedirs(
            user_folder, exist_ok=True
        )  # Create user folder if it doesn't exist

        # Define a fixed filename for the model
        fixed_filename = "model.pkl"  # or use a dynamic name if you prefer
        file_path = os.path.join(
            user_folder, fixed_filename
        )  # Save model with a fixed name

        file.save(file_path)  # Save or overwrite the existing file

        # Save model path to "database"
        user_models[user.table_name] = file_path
        return jsonify({"message": "Model uploaded successfully."}), 200
    else:
        return jsonify({"error": "Invalid file format."}), 400


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
