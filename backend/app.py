import os
import pickle
from ml_model.data_access.file_reader import FileReader
from ml_model.datapoint_entity import DataPoint
from ml_model.data_access.model_saver import save_model
from ml_model.preprocessing.data_preprocessing import DataProcessor
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from main import (
    connect_to_database,
    import_csv_to_db,
    delete_csv_data,
    get_headers,
    update_comparison_csv,
    get_values_under_header,
    update_db_for_user,
    get_last_login_data,
)
from ml_model.model import model

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/api/get-all-users", methods=["GET"])
def get_all_users():
    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, firstname, lastname, email, password FROM users")
        users = cursor.fetchall()
        cursor.close()
        connection.close()

        user_data = [
            {
                "id": user[0],
                "firstname": user[1],
                "lastname": user[2],
                "email": user[3],
                "password": user[4],
            }
            for user in users
        ]
        return jsonify(user_data), 200

    return jsonify({"error": "Database connection error"}), 500


@app.route("/api/headers", methods=["POST"])
def headers():
    data = request.get_json()
    curr_user = data.get("curr_user")

    if curr_user:
        return jsonify(get_headers(curr_user))
    else:
        return jsonify({"error": "Missing required data."}), 400


@app.route("/api/values-under-header", methods=["POST"])
def values_under_header():
    data = request.get_json()
    curr_user = data.get("curr_user")
    header = data.get("header")

    if header and curr_user:
        values = get_values_under_header(curr_user, header)
        delete_csv_data()
        return jsonify(values)
    else:
        return jsonify({"error": "Missing required data."}), 400


# TODO When user log ins, call this and pass in his data stored in user json
@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    demographics = data.get("demographics")
    choices = data.get("choices")
    curr_user = data.get("curr_user")
    time = data.get("time", None)

    print("Generating Data received: ", demographics, choices, time)

    if demographics and choices and curr_user:
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

        update_comparison_csv(curr_user, demographics, choices, time)
        update_db_for_user(curr_user, demographics, choices, time)

        output = model()  # TODO akshatt armagan function call
        print(output)

        # delete_csv_data()

        return jsonify({f"{key[0]}_{key[1]}": value for key, value in output.items()})

    return jsonify({"error": "Missing required data."}), 400


@app.route("/api/get-prev-data", methods=["POST"])
def get_prev_data():
    data = request.get_json()
    curr_user = data.get("curr_user")

    if curr_user:
        demographics, choices, time = get_last_login_data(curr_user)
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
    curr_user = request.form.get("curr_user")
    csv_to_read = request.files.get("csv_to_read")

    if not curr_user or not csv_to_read:
        return jsonify({"error": "Missing required data."}), 400

    if import_csv_to_db(csv_to_read, curr_user):
        return jsonify({"message": "Data uploaded successfully."}), 200
    else:
        return jsonify({"error": "Error uploading data."}), 500


UPLOAD_FOLDER = "uploads/"  # Directory to save uploaded models
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock database (in-memory for this example)
user_models = {}


@app.route("/api/upload-model", methods=["POST"])
def upload_model():
    curr_user = request.form.get("curr_user")
    file = request.files.get("model_file")

    if not curr_user or not file:
        return jsonify({"error": "Missing required data."}), 400

    if file and file.filename.endswith(".pkl"):
        # Create a directory for the user if it doesn't exist
        user_folder = os.path.join(UPLOAD_FOLDER, curr_user)
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
        user_models[curr_user] = file_path
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
