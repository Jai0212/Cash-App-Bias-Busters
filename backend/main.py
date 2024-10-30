import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import tempfile
import pandas as pd
import csv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
    "ssl_disabled": False,  # Change to True if you want to disable SSL
}


def create_temp_cert(cert_content):
    """Create a temporary SSL certificate."""
    with tempfile.NamedTemporaryFile(delete=False) as temp_cert:
        temp_cert.write(cert_content.encode())
        return temp_cert.name


def connect_to_database():
    """Establish a connection to the MySQL database."""
    try:
        print("Connecting to the database...")
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("Connected to the database.")
            return connection
    except Error as e:
        print(f"Error connecting to the database: {e}")
        return None


def see_all_tables():
    """See all tables in the database."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print("Tables in the database:")
            for table in tables:
                print(table[0])

    except Error as e:
        print(f"Error: {e}")


def delete_table(table_name):
    """Delete the table_name"""
    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        cursor = connection.cursor()
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        print("Table deleted successfully.")


def create_table(cursor, table_name):
    """Create the cashapp_data table if it doesn't exist."""
    cursor.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gender VARCHAR(255),
            age INT,
            race VARCHAR(255),
            state VARCHAR(255),
            timestamp VARCHAR(255),
            is_biased INT
        )
    """
    )
    print("Table created successfully.")


def import_csv_to_db(csv_file_path, table_name):
    """Read the CSV file and import relevant data into the database."""
    # Define the required columns
    required_columns = ["gender", "age", "race", "state", "timestamp", "is_biased"]

    # Read the CSV file
    df = pd.read_csv(csv_file_path)

    # Normalize column names to lowercase
    df.columns = df.columns.str.lower()

    # Filter for the required columns
    filtered_df = df[[col for col in required_columns if col in df.columns]]

    # Establish database connection
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            create_table(cursor, table_name)

            # Insert data into the table
            for _, row in filtered_df.iterrows():
                cursor.execute(
                    f"""
                    INSERT INTO {table_name} (gender, age, race, state, timestamp, is_biased) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """,
                    (
                        row["gender"],
                        row["age"],
                        row["race"],
                        row["state"],
                        row["timestamp"],
                        row["is_biased"],
                    ),
                )

            connection.commit()  # Commit the transaction
            print("Data imported successfully.")

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# def insert_data(cursor, data):
#     """Insert records into the cashapp_data table."""
#     cursor.executemany("INSERT INTO cashapp_data (name) VALUES (%s)", data)
#     print(f"Inserted {len(data)} records successfully.")


def fetch_data(table_name):
    """Fetch and display all records from the specified table, including headers."""

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()

        cursor.execute(f"SELECT * FROM {table_name}")
        results = cursor.fetchall()

        # Fetching the column headers
        headers = [desc[0] for desc in cursor.description]

        if results:
            print(f"Data fetched from {table_name}:")
            # Print headers
            print(headers)
            # Print each row of data
            for row in results:
                print(row)
            return headers, results
        else:
            print("No data found.")
            return headers, []

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def save_data_to_csv(table_name):
    """Save data from the specified table to a CSV file, including headers."""

    # Call to delete existing data in the CSV file
    delete_csv_data("database/output.csv")  # Pass the file path to the delete function

    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        headers, data = fetch_data(table_name)  # Fetch headers and data

        csv_file_path = "database/output.csv"

        # Open the CSV file for writing
        with open(csv_file_path, mode="w", newline="") as file:
            writer = csv.writer(file)
            # Write the headers first
            writer.writerow(headers)
            # Write the data rows
            writer.writerows(data)

        print(f"Data saved to {csv_file_path}")

        cursor.close()  # Close the cursor
        connection.close()  # Close the database connection


def delete_csv_data(csv_file_path="database/output.csv"):
    """Delete all data from the specified CSV file."""
    try:
        with open(csv_file_path, mode="w", newline="") as file:
            # Optionally, you can write the header again if needed
            # writer = csv.writer(file)
            # writer.writerow(['gender', 'age', 'race', 'state', 'timestamp'])  # Uncomment if you want to keep the header

            print(f"All data deleted from {csv_file_path}.")
    except Exception as e:
        print(f"Error deleting data from {csv_file_path}: {e}")


def main():
    """Main function to run the database operations."""
    temp_cert_path = None
    try:

        connection = connect_to_database()
        if connection:
            cursor = connection.cursor()

            # Only to be used when we want to create a tabel
            # create_table(cursor)

            # Specify the actual data you want to insert
            # actual_data = [
            #     ("John Doe",),
            #     ("Jane Smith",),
            #     ("Alice Johnson",),
            #     ("Bob Brown",),
            #     # Add more names as needed
            # ]
            #
            # insert_data(cursor, actual_data)
            # connection.commit()  # Commit the insertion

            # fetch_data()

    except Error as e:
        print(f"Error: {e}")

    finally:
        # Close cursor and connection
        if "cursor" in locals():
            cursor.close()
        if "connection" in locals():
            connection.close()
        if temp_cert_path:
            os.remove(temp_cert_path)
        print("Connection closed.")


if __name__ == "__main__":
    pass
    #     see_all_tables(cursor)

    # import_csv_to_db("database/test.csv", "test_table_2")

    # connection = connect_to_database()
    # if connection:
    #     cursor = connection.cursor()
    #     print(fetch_data(cursor, "test_table_2"))

    # save_data_to_csv("test_table_2")
    # delete_csv_data('database/output.csv')
