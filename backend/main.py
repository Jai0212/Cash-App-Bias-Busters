import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import tempfile
import pandas as pd
import csv
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Tuple
from werkzeug.datastructures import FileStorage
from ml_model.model import model

curr_dir = os.path.dirname(__file__)
DATABASE_OUTPUT_PATH = os.path.join(curr_dir, "../database/output.csv")

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


def create_temp_cert(cert_content: str) -> str:
    """Create a temporary SSL certificate."""

    with tempfile.NamedTemporaryFile(delete=False) as temp_cert:
        temp_cert.write(cert_content.encode())
        return temp_cert.name


def connect_to_database() -> Optional[mysql.connector.connection.MySQLConnection]:
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


def see_all_tables() -> None:
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

            cursor.close()
            connection.close()

    except Error as e:
        print(f"Error: {e}")


def delete_table(table_name: str) -> None:
    """Delete the table_name"""

    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        cursor = connection.cursor()
        cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
        print("Table deleted successfully.")

        cursor.close()
        connection.close()


def create_table(cursor: mysql.connector.cursor.MySQLCursor, table_name: str) -> None:
    """Create the cashapp_data table if it doesn't exist."""

    # Sanitize the table name by replacing invalid characters or use backticks
    sanitized_table_name = f"`{table_name}`"  # Backticks allow special characters

    cursor.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {sanitized_table_name} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gender VARCHAR(255),
            age INT,
            race VARCHAR(255),
            state VARCHAR(255),
            timestamp VARCHAR(255),
            action_status INT
        )
        """
    )
    print("Table created successfully.")


def import_csv_to_db(csv_file: FileStorage, table_name: str) -> bool:
    """Read the CSV file and import relevant data into the database."""

    required_columns = ["gender", "age", "race", "state", "timestamp", "action_status"]
    critical_columns = ["timestamp", "action_status"]

    df = pd.read_csv(csv_file)

    df.columns = df.columns.str.lower()

    if not all(col in df.columns for col in critical_columns):
        print("Critical columns missing. Operation aborted.")
        return False

    available_columns = [col for col in required_columns if col in df.columns]
    filtered_df = df[available_columns]

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            create_table(cursor, table_name)

            for _, row in filtered_df.iterrows():
                # Prepare values for only the columns present in the CSV
                values = tuple(row[col] for col in available_columns)
                columns_str = ", ".join(available_columns)
                placeholders = ", ".join(["%s"] * len(available_columns))

                cursor.execute(
                    f"INSERT INTO `{table_name}` ({columns_str}) VALUES ({placeholders})",
                    values,
                )

            connection.commit()
            print("Data imported successfully.")

            return True

        return False

    except Error as e:
        print(f"Error: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def fetch_data(table_name: str) -> Tuple[List[str], Tuple[str, ...]]:
    """Fetch and display all records from the specified table, including headers."""

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()

        cursor.execute(f"SELECT * FROM `{table_name}`")
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


def save_data_to_csv(table_name: str) -> None:
    """Save data from the specified table to a CSV file, including headers."""

    # Call to delete existing data in the CSV file
    delete_csv_data(DATABASE_OUTPUT_PATH)  # Pass the file path to the delete function

    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        headers, data = fetch_data(table_name)  # Fetch headers and data

        csv_file_path = DATABASE_OUTPUT_PATH

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


def get_data_for_time(table_name: str, time: str) -> None:
    """Get the data for the specified time period."""

    delete_csv_data()
    save_data_to_csv(table_name)

    df = pd.read_csv(DATABASE_OUTPUT_PATH)

    # Convert the 'Timestamp' column to datetime format
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    if time == "day":
        days = 1
    elif time == "week":
        days = 7
    elif time == "month":
        days = 30
    else:
        days = 365

    cutoff_date = datetime.now() - timedelta(days=days)

    filtered_df = df[df["timestamp"] >= cutoff_date]

    filtered_df.to_csv(DATABASE_OUTPUT_PATH, index=False)


def delete_csv_data(csv_file_path: str = DATABASE_OUTPUT_PATH) -> None:
    """Delete all data from the specified CSV file."""

    try:
        with open(csv_file_path, mode="w", newline="") as file:
            # Optionally, you can write the header again if needed
            # writer = csv.writer(file)
            # writer.writerow(['gender', 'age', 'race', 'state', 'timestamp'])  # Uncomment if you want to keep the header

            print(f"All data deleted from {csv_file_path}.")
    except Exception as e:
        print(f"Error deleting data from {csv_file_path}: {e}")


def get_headers(table_name: str) -> List[str]:
    """Get the headers of the table."""

    connection = connect_to_database()
    if connection:
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM `{table_name}`")

        critical_columns = ["timestamp", "action_status"]
        headers = [
            desc[0]
            for desc in cursor.description
            if desc[0] not in critical_columns + ["id"]
        ]

        print(headers)

        if len(headers) < 2:
            print("Less than 2 demographics in dataset.")
            return []
        else:
            return headers


def get_values_under_header(table_name: str, header: str) -> List[str]:
    """Get the unique values under the specified header."""

    delete_csv_data()
    save_data_to_csv(table_name)

    df = pd.read_csv(DATABASE_OUTPUT_PATH)

    if header not in get_headers(table_name):
        print(f"Header '{header}' does not exist in the dataset.")
        return []

    unique_values = df[header].unique()

    print(unique_values.tolist())

    if header == "age":
        result = set()
        for i in unique_values.tolist():
            if i < 10:
                result.add("0-10")
            elif i < 20:
                result.add("10-20")
            elif i < 30:
                result.add("20-30")
            elif i < 40:
                result.add("30-40")
            elif i < 50:
                result.add("40-50")
            else:
                result.add("50-60")

        print(list(result))
        return list(result)

    return unique_values.tolist()


def update_comparison_csv(
    curr_user: str, demographics: List[str], choices: Dict[str, List[str]], time: str
) -> None:
    """Update the comparison CSV file with the user's selections."""

    delete_csv_data()
    print("DEBUG", curr_user, demographics, choices, time)
    if time:
        get_data_for_time(curr_user, time)
    else:
        save_data_to_csv(curr_user)

    df = pd.read_csv(DATABASE_OUTPUT_PATH)

    critical_columns = ["id", "timestamp", "action_status"]

    valid_columns = [col for col in demographics + critical_columns if col in df.columns]
    filtered_df = df[valid_columns]

    for dem in demographics:
        if dem in choices:
            filtered_df = filtered_df[filtered_df[dem].isin(choices[dem])]

    filtered_df.to_csv(DATABASE_OUTPUT_PATH, index=False)


def update_db_for_user(
    curr_user: str, demographics: List[str], choices: Dict[str, List[str]], time: str
) -> None:
    """Update the database for the specified user with the selected demographics and choices."""

    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        cursor = connection.cursor()

    try:
        if not time:
            time = "year"

        # Prepare the SQL query and parameters
        set_clauses = []
        parameters = []

        # Check if we have at least one demographic to update
        if len(demographics) > 0:
            # Update demographic_one and its choices
            demographic_one = demographics[0]
            set_clauses.append("demographic_1 = %s")
            parameters.append(demographic_one)

            for i in range(4):
                choice_key = f"choice_{i + 1}_demographic_1"
                if len(choices.get(demographic_one, [])) > i:
                    set_clauses.append(f"{choice_key} = %s")
                    parameters.append(choices[demographic_one][i])
                else:
                    set_clauses.append(f"{choice_key} = %s")
                    parameters.append(None)  # Set to NULL if not available

        if len(demographics) > 1:
            # Update demographic_two and its choices
            demographic_two = demographics[1]
            set_clauses.append("demographic_2 = %s")
            parameters.append(demographic_two)

            for i in range(4):
                choice_key = f"choice_{i + 1}_demographic_2"
                if len(choices.get(demographic_two, [])) > i:
                    set_clauses.append(f"{choice_key} = %s")
                    parameters.append(choices[demographic_two][i])
                else:
                    set_clauses.append(f"{choice_key} = %s")
                    parameters.append(None)  # Set to NULL if not available

        # Add the time variable
        set_clauses.append("time = %s")
        parameters.append(time)

        # Complete the WHERE clause
        where_clause = "email = %s"
        parameters.append(curr_user)

        # Construct the final SQL query
        sql_query = f"""
        UPDATE users
        SET {', '.join(set_clauses)}
        WHERE {where_clause}
        """

        # Execute the update query
        cursor.execute(sql_query, tuple(parameters))
        connection.commit()
        print("User data updated successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# TODO make api for this by calling all appropriate function
def get_last_login_data(
    curr_user: str,
) -> Tuple[Optional[List[str]], Optional[Dict[str, List[str]]], Optional[str]]:
    """Retrieve the last login demographics and choices for the specified user."""

    connection = mysql.connector.connect(**DB_CONFIG)
    demographics = []
    choices = {}

    if connection.is_connected():
        cursor = connection.cursor()

    try:
        # Prepare the SQL query to fetch the demographics and choices
        cursor.execute(
            """
            SELECT demographic_1, choice_1_demographic_1, choice_2_demographic_1,
                   choice_3_demographic_1, choice_4_demographic_1,
                   demographic_2, choice_1_demographic_2, choice_2_demographic_2,
                   choice_3_demographic_2, choice_4_demographic_2, time
            FROM users
            WHERE email = %s
        """,
            (curr_user,),
        )

        result = cursor.fetchone()

        if result:
            # Unpack the result
            demographic_one = result[0]
            demographic_two = result[5]
            time = result[10]

            if not time:
                time = "year"

            # Add demographics to the list, handling None values
            if demographic_one is not None:
                demographics.append(demographic_one)
                choices[demographic_one] = [
                    result[1] if result[1] is not None else None,
                    result[2] if result[2] is not None else None,
                    result[3] if result[3] is not None else None,
                    result[4] if result[4] is not None else None,
                ]

            if demographic_two is not None:
                demographics.append(demographic_two)
                choices[demographic_two] = [
                    result[6] if result[6] is not None else None,
                    result[7] if result[7] is not None else None,
                    result[8] if result[8] is not None else None,
                    result[9] if result[9] is not None else None,
                ]

            return list(set(demographics)), choices, time
        else:
            print("No data found for the specified user.")
            return None, None, None

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None, None, None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def add_extra_columns() -> None:
    """Add extra columns to the table."""

    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        cursor = connection.cursor()

    try:
        cursor.execute(
            """
            ALTER TABLE users 
            ADD (
                demographic_1 VARCHAR(255) DEFAULT NULL,
                choice_1_demographic_1 VARCHAR(255) DEFAULT NULL,
                choice_2_demographic_1 VARCHAR(255) DEFAULT NULL,
                choice_3_demographic_1 VARCHAR(255) DEFAULT NULL,
                choice_4_demographic_1 VARCHAR(255) DEFAULT NULL,
                
                demographic_2 VARCHAR(255) DEFAULT NULL,
                choice_1_demographic_2 VARCHAR(255) DEFAULT NULL,
                choice_2_demographic_2 VARCHAR(255) DEFAULT NULL,
                choice_3_demographic_2 VARCHAR(255) DEFAULT NULL,
                choice_4_demographic_2 VARCHAR(255) DEFAULT NULL,

                time VARCHAR(255) DEFAULT 'year'
            )
            """
        )
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# def top_common_states(csv_file_path, column_name, top_n=5):
#     """Read the CSV file and return the top N most common values in the specified column."""
#     # Read the CSV file into a DataFrame
#     df = pd.read_csv(csv_file_path)

#     # Check if the specified column exists in the DataFrame
#     if column_name not in df.columns:
#         raise ValueError(f"Column '{column_name}' does not exist in the CSV file.")

#     # Count the occurrences of each value in the specified column
#     common_values = df[column_name].value_counts().head(top_n)

#     return common_values


# def insert_data(cursor, data):
#     """Insert records into the cashapp_data table."""
#     cursor.executemany("INSERT INTO cashapp_data (name) VALUES (%s)", data)
#     print(f"Inserted {len(data)} records successfully.")

if __name__ == "__main__":
    # update_comparison_csv("jj@gmail.com", ['race', 'gender'], {'race': ['Black', 'Other', 'Hispanic', ''], 'gender': ['Non-binary', 'Male', 'Female', '']}, "year")
    # add_extra_columns()
    # update_db_for_user("jj@gmail.com", ["race", "state"], {"race": ["Black", "White"], "state": ["Hispanic", "Black", "Other"]}, "month")
    # fetch_data("users")
    # print(get_last_login_data("jj@gmail.com")[0])
    # print(get_last_login_data("jj@gmail.com")[1])

    # see_all_tables()
    # import_csv_to_db("database/test.csv", "test_table")
    # fetch_data("test_table")
    # save_data_to_csv("test_table")
    save_data_to_csv("test_table")
    update_comparison_csv("jj@gmail.com", ['race', 'state'], {'race': ['Black', 'White', 'Hispanic', 'Mixed'], 'state': ['WI', 'PA', 'OK', 'IL']}, "year")
    print(model())
    # get_headers("test_table")
    # get_values_under_header("test_table", "state")
    # update_comparison_csv("test_table", ["state", "race"], {"state": ["WI", "NY", "AZ"], "race": ["Hispanic", "Black"]}, "year")
    pass
