from dotenv import load_dotenv
import os
import flask
from flask import jsonify
from flask_cors import CORS
import mysql.connector

# Load environment variables
load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DATABASE = os.getenv("DB_DATABASE")

# Initialize the Flask app
app = flask.Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Create a route to fetch data
@app.route('/get-data', methods=['GET'])
def get_data():
    # connection = mysql.connector.connect(
    #     host=DB_HOST,
    #     user=DB_USER,
    #     password=DB_PASSWORD,
    #     database=DB_DATABASE
    # )

    # cursor = connection.cursor()

    # cursor.execute("SELECT * FROM CashApp_Data")

    # rows = cursor.fetchall()

    # cursor.close()
    # connection.close()

    data = []
    rows = [["1", "2", "3"]]
    for row in rows:
        # Assuming your table has columns (id, name, amount), adjust as needed
        data.append({
            "id": row[0],
            "name": row[1],
            "amount": row[2]
        })

    # Return the data as a JSON response
    return jsonify(data)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
