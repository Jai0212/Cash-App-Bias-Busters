
from dotenv import load_dotenv
import os
load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DATABASE = os.getenv("DB_DATABASE")

import mysql.connector

# Create a connection to the MySQL database
connection = mysql.connector.connect(
    host=DB_HOST,      # e.g., "localhost" if the database is on your machine
    user=DB_USER,  # MySQL username
    password=DB_PASSWORD,  # MySQL password
    database=DB_DATABASE  # Name of the database you want to access
)

# Create a cursor object to execute queries
cursor = connection.cursor()

# Execute a simple query
cursor.execute("SELECT * FROM CashApp_Data")

# Fetch and print the results
rows = cursor.fetchall()
for row in rows:
    print(row)

# Close the cursor and the connection
cursor.close()
connection.close()