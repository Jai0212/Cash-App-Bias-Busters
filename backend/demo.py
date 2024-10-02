from flask import Flask, jsonify
from mysql.connector import Error
from main import connect_to_database, fetch_data
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/get-data', methods=['GET'])
def get_data():
    """Fetch data from the database and return as JSON."""
    try:
        connection = connect_to_database()
        cursor = connection.cursor()
        data = fetch_data(cursor)
         
        response_data = [{'name': row[1]} for row in data]
        return jsonify(response_data), 200

    except Error as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

@app.route('/')
def home():
    return "Welcome to the Backend!"

if __name__ == "__main__":
    app.run(debug=True)
