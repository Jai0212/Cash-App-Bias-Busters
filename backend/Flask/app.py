import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv


load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
    "ssl_disabled": False
}

app = Flask(__name__)
CORS(app)

def connect_to_database():
    """Establish a connection to the MySQL database."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to the database: {e}")
        return None

def create_users_table():
    """Create the users table if it doesn't exist."""
    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstname VARCHAR(255) NOT NULL,
                lastname VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        """)
        connection.commit()  # Commit the creation of the table
        cursor.close()
        connection.close()

@app.route('/api/signup', methods=['POST'])
def signup():

    data = request.get_json()

    required_fields = ['firstname', 'lastname', 'email', 'password', 'confirmPassword']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    if data['password'] != data['confirmPassword']:
        return jsonify({'error': 'Passwords do not match'}), 400

    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400

        cursor.execute("""
            INSERT INTO users (firstname, lastname, email, password) 
            VALUES (%s, %s, %s, %s)
        """, (data['firstname'], data['lastname'], data['email'], data['password']))
        connection.commit()  # Commit the insertion
        cursor.close()
        connection.close()

    return jsonify({'message': 'User registered successfully!'}), 201

@app.route('/api/get-userdata', methods=['GET'])
def get_userdata():
    """Fetch user data from the database and return as JSON."""
    try:
        connection = connect_to_database()
        cursor = connection.cursor()
        cursor.execute("SELECT firstname, lastname, email FROM users")
        data = cursor.fetchall()

        # Prepare the response data
        response_data = [{'firstname': row[0], 'lastname': row[1], 'email': row[2]} for row in data]
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
    create_users_table()  # Create the table at startup
    app.run(debug=True, host='127.0.0.1', port=5000)
