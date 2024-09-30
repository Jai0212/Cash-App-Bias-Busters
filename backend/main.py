# # from dotenv import load_dotenv
# # import os
# # import mysql.connector
# # import tempfile
# #
# # # Load environment variables
# # load_dotenv()
# #
# # DB_HOST = os.getenv("DB_HOST")
# # DB_USER = os.getenv("DB_USER")
# # DB_PASSWORD = os.getenv("DB_PASSWORD")
# # DB_DATABASE = os.getenv("DB_DATABASE")
# # DB_CERTIFICATE = os.getenv("DB_CERTIFICATE")
# # DB_PORT = os.getenv("DB_PORT")
# #
# # with tempfile.NamedTemporaryFile(delete=False) as temp_cert:
# #     temp_cert.write(DB_CERTIFICATE.encode())
# #     temp_cert_path = temp_cert.name
# #
# #
# # connection = mysql.connector.connect(
# #     host=DB_HOST,
# #     user=DB_USER,
# #     password=DB_PASSWORD,
# #     database=DB_DATABASE,
# #     port=DB_PORT,
# #     ssl_verify_cert=True,
# #     ssl_ca=temp_cert_path
# # )
# #
# # cursor = connection.cursor()
# #
# # cursor.execute("""
# #     CREATE TABLE IF NOT EXISTS cashapp_data (
# #         id INT AUTO_INCREMENT PRIMARY KEY,
# #         name VARCHAR(255)
# #     )
# # """)
# # connection.commit()  # Ensure the table creation is committed
# # print("Table created successfully")
# #
# # cursor.close()
# # connection.close()
# #
# # os.remove(temp_cert_path)
# import mysql.connector
# import os
#
# # Establish the database connection
# try:
#     print("Connecting to the database...")
#     connection = mysql.connector.connect(
#         host='cashapp-cashapp-9667.b.aivencloud.com',
#         port=17091,
#         user='avnadmin',
#         password='AVNS_5S6QYQE-TygM_BSYuNy',  # replace with your actual password
#         database='defaultdb',
#         ssl_disabled=False  # Make sure to use SSL if required
#     )
#     print("Connected to the database.")
#
#     # Create a cursor object to execute SQL commands
#     cursor = connection.cursor()
#
#     # Create the table
#     cursor.execute("""
#         CREATE TABLE IF NOT EXISTS cashapp_data (
#             id INT AUTO_INCREMENT PRIMARY KEY,
#             name VARCHAR(255)
#         )
#     """)
#     connection.commit()  # Ensure the table creation is committed
#     print("Table created successfully")
#
#     # Insert a record into the table
#     cursor.execute("INSERT INTO cashapp_data (name) VALUES (%s)", ("John Doe",))
#     connection.commit()  # Commit the insertion
#     print("Data inserted successfully")
#
#     # Query data from the table
#     cursor.execute("SELECT * FROM cashapp_data")
#     result = cursor.fetchall()  # Fetch all rows
#     for row in result:
#         print(row)  # Display each row
#
# except mysql.connector.Error as err:
#     print(f"Error: {err}")
#
# finally:
#     # Close the cursor and connection
#     if 'cursor' in locals():
#         cursor.close()
#     if 'connection' in locals():
#         connection.close()
#     print("Connection closed.")
import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
    "ssl_disabled": False  # Change to True if you want to disable SSL
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


def create_table(cursor):
    """Create the cashapp_data table if it doesn't exist."""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cashapp_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255)
        )
    """)
    print("Table created successfully.")


def insert_data(cursor, data):
    """Insert records into the cashapp_data table."""
    cursor.executemany("INSERT INTO cashapp_data (name) VALUES (%s)", data)
    print(f"Inserted {len(data)} records successfully.")


def fetch_data(cursor):
    """Fetch and display all records from the cashapp_data table."""
    cursor.execute("SELECT * FROM cashapp_data")
    results = cursor.fetchall()
    if results:
        print("Data fetched from cashapp_data:")
        for row in results:
            print(row)
    else:
        print("No data found.")


def main():
    """Main function to run the database operations."""
    temp_cert_path = None
    try:

        connection = connect_to_database()
        if connection:
            cursor = connection.cursor()

            create_table(cursor)

            # Specify the actual data you want to insert
            actual_data = [
                ("John Doe",),
                ("Jane Smith",),
                ("Alice Johnson",),
                ("Bob Brown",),
                # Add more names as needed
            ]

            insert_data(cursor, actual_data)
            connection.commit()  # Commit the insertion

            fetch_data(cursor)

    except Error as e:
        print(f"Error: {e}")

    finally:
        # Close cursor and connection
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()
        if temp_cert_path:
            os.remove(temp_cert_path)
        print("Connection closed.")


if __name__ == "__main__":
    main()

