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
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to the database: {e}")
        return None


def create_users_table():
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
        connection.commit()
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

    password = data['password']

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
        """, (data['firstname'], data['lastname'], data['email'], password))
        connection.commit()
        cursor.close()
        connection.close()

    return jsonify({'message': 'User registered successfully!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        connection.close()

        if user and user[1] == password:
            return jsonify({'message': 'Login successful!'}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({'error': 'Database connection error'}), 500


@app.route('/api/get-all-users', methods=['GET'])
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
                'id': user[0],
                'firstname': user[1],
                'lastname': user[2],
                'email': user[3],
                'password': user[4]
            }
            for user in users
        ]
        return jsonify(user_data), 200

    return jsonify({'error': 'Database connection error'}), 500


@app.route('/')
def home():
    return "Welcome to the Backend!"


if __name__ == "__main__":
    create_users_table()
    app.run(debug=True, host='127.0.0.1', port=5000)
