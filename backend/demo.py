from flask import Flask, jsonify, request
from mysql.connector import Error
from main import (
    connect_to_database,
    fetch_data,
    import_csv_to_db,
    save_data_to_csv,
    delete_csv_data,
)
from flask_cors import CORS
import os
import pickle

app = Flask(__name__)

CORS(app)


@app.route("/")
def home():
    return "Welcome to the Backend!"


# @app.route('/get-data', methods=['GET'])
# def get_data():
#     """Fetch data from the database and return as JSON."""
#     try:
#         connection = connect_to_database()
#         cursor = connection.cursor()
#         data = fetch_data(cursor)

#         response_data = [{'name': row[1]} for row in data]
#         return jsonify(response_data), 200

#     except Error as e:
#         return jsonify({'error': str(e)}), 500

#     finally:
#         if 'cursor' in locals():
#             cursor.close()
#         if 'connection' in locals():
#             connection.close()


@app.route("/api/upload-data", methods=["POST"])
def upload_data():
    """Upload data to the database."""
    curr_user = request.form.get("curr_user")  # Get user ID from form
    csv_to_read = request.files.get("csv_to_read")  # Get the uploaded CSV file
    model = request.form.get("model")  # Get model data from form, if applicable

    if not curr_user or not csv_to_read or not model:
        return jsonify({"error": "Missing required data."}), 400

    # Process the uploaded CSV and other data
    import_csv_to_db(csv_to_read, curr_user)
    save_data_to_csv(curr_user)

    # TODO: Implement function logic for akshat and armagan

    delete_csv_data("database/output.csv")

    return jsonify({"message": "Data uploaded successfully."}), 200


@app.route("/api/time", methods=["GET"])
def time():
    time = request.form.get("time")
    # TODO akshat and armagan function
    return "Time route"


UPLOAD_FOLDER = "uploads/"  # Directory to save uploaded models
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock database (in-memory for this example)
user_models = {}


@app.route("/upload_model", methods=["POST"])
def upload_model():
    curr_user = request.form.get("curr_user")  # Get user ID from form
    file = request.files.get("model_file")

    if file and file.filename.endswith(".pkl"):
        # Create a directory for the user if it doesn't exist
        user_folder = os.path.join(UPLOAD_FOLDER, curr_user)
        os.makedirs(
            user_folder, exist_ok=True
        )  # Create user folder if it doesn't exist

        file_path = os.path.join(
            user_folder, file.filename
        )  # Save model with user's name

        file.save(file_path)  # Save or overwrite the existing file

        # Save model path to "database"
        user_models[curr_user] = file_path
        return jsonify({"message": "Model uploaded successfully."}), 200
    else:
        return jsonify({"error": "Invalid file format."}), 400


def load_model(curr_user: str):
    model_path = UPLOAD_FOLDER + curr_user

    if model_path and os.path.exists(model_path):
        with open(model_path, "rb") as file:
            model = pickle.load(file)  # Load the model
        return model
    else:
        print("Model not found.")
        return None


if __name__ == "__main__":
    app.run(debug=True)
