from app.infrastructure.db_connection_manager import DbConnectionManager
from app.repositories.interfaces import FileRepository
from app.repositories import SqliteDbRepo
from app.entities.user import User
from mysql.connector import Error
import csv
import pandas as pd
from datetime import datetime, timedelta
from werkzeug.datastructures import FileStorage


class CsvFileRepo(FileRepository):
    def __init__(self, user: User, file_path: str):
        """Initialize the file path and database connection."""
        self.connection = None
        self.file_path = file_path

        self.user = user
        self.table_name = user.table_name
        self.db_repo = SqliteDbRepo(user)

    def connect(self):
        self.connection = DbConnectionManager.get_connection()

    def import_csv_to_db(self, csv_file: FileStorage) -> bool:
        """Read the CSV file and import relevant data into the database."""

        self.connect()

        required_columns = [
            "gender",
            "age",
            "race",
            "state",
            "timestamp",
            "action_status",
        ]
        critical_columns = ["timestamp", "action_status"]

        df = pd.read_csv(csv_file)

        df.columns = df.columns.str.lower()

        if not all(col in df.columns for col in critical_columns):
            print("Critical columns missing. Operation aborted.")
            return False

        available_columns = [col for col in required_columns if col in df.columns]
        filtered_df = df[available_columns]

        try:
            if self.connection is None:
                print("No database connection available.")
                return False

            print(self.connection)
            print(self.connection.is_connected())
            if self.connection.is_connected():
                cursor = self.connection.cursor()
                self.db_repo.create_table()

                for _, row in filtered_df.iterrows():
                    # Prepare values for only the columns present in the CSV
                    values = tuple(row[col] for col in available_columns)
                    columns_str = ", ".join(available_columns)
                    placeholders = ", ".join(["%s"] * len(available_columns))

                    cursor.execute(
                        f"INSERT INTO `{self.table_name}` ({columns_str}) VALUES ({placeholders})",
                        values,
                    )

                self.connection.commit()
                print("Data imported successfully.")
                cursor.close()
                return True

            cursor.close()
            return False

        except Error as e:
            print(f"MySQL Error: {e}")
            return False

        except Exception as e:
            print(f"General Error: {e}")
            return False

    def save_data_to_csv(self) -> None:
        """Save data from the specified table to a CSV file, including headers."""

        self.connect()

        try:
            if self.connection is None:
                print("No database connection available.")
                return

            self.delete_csv_data()

            cursor = self.connection.cursor()
            headers, data = self.db_repo.fetch_data()  # Fetch headers and data

            csv_file_path = self.file_path

            # Open the CSV file for writing
            with open(csv_file_path, mode="w", newline="") as file:
                writer = csv.writer(file)
                # Write the headers first
                writer.writerow(headers)
                # Write the data rows
                writer.writerows(data)

            print(f"Data saved to {csv_file_path}")

            cursor.close()  # Close the cursor

        except Error as e:
            print(f"MySQL Error: {e}")
            raise

        except Exception as e:
            print(f"General Error: {e}")
            raise

    def delete_csv_data(self) -> None:
        """Delete all data from the specified CSV file."""

        self.connect()

        try:
            with open(self.file_path, mode="w", newline="") as file:
                # Optionally, you can write the header again if needed
                # writer = csv.writer(file)
                # writer.writerow(['gender', 'age', 'race', 'state', 'timestamp'])  # Uncomment if you want to keep the header

                print(f"All data deleted from {self.file_path}.")
        except Exception as e:
            print(f"Error deleting data from {self.file_path}: {e}")

    def get_headers(self) -> list[str]:
        """Get the headers of the table."""

        self.connect()

        try:
            if self.connection is None:
                print("No database connection available.")
                return []

            cursor = self.connection.cursor()
            cursor.execute(f"SELECT * FROM `{self.table_name}`")

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

        except Error as e:
            print(f"MySQL Error: {e}")
            return []

        except Exception as e:
            print(f"General Error: {e}")
            return []

    def get_data_for_time(self, time: str) -> None:
        """Get the data for the specified time period."""

        self.connect()

        self.delete_csv_data()
        self.save_data_to_csv()

        df = pd.read_csv(self.file_path)

        df["timestamp"] = pd.to_datetime(df["timestamp"])

        latest_timestamp = df["timestamp"].max()

        if time == "day":
            days = 1
        elif time == "week":
            days = 7
        elif time == "month":
            days = 30
        else:
            days = 365

        cutoff_date = latest_timestamp - timedelta(days=days)

        filtered_df = df[df["timestamp"] >= cutoff_date]

        filtered_df.to_csv(self.file_path, index=False)

    def update_comparison_csv(
        self,
        demographics: list[str],
        choices: dict[str, list[str]],
        time: str,
    ) -> None:
        """Update the comparison CSV file with the user's selections."""

        self.connect()

        self.delete_csv_data()

        if time:
            self.get_data_for_time(time)
        else:
            self.save_data_to_csv()

        df = pd.read_csv(self.file_path)

        critical_columns = ["id", "timestamp", "action_status"]
        valid_columns = [
            col for col in demographics + critical_columns if col in df.columns
        ]
        filtered_df = df[valid_columns]

        for dem in demographics:
            if dem in choices:
                if dem == "age":
                    # For age, parse range strings and filter based on ranges
                    age_ranges = []
                    for range_str in choices[dem]:
                        try:
                            min_age, max_age = map(int, range_str.split("-"))
                            age_ranges.append((min_age, max_age))
                        except ValueError:
                            print(f"Invalid range format: {range_str}")
                            continue

                    # Apply age range filtering
                    age_filter = filtered_df["age"].apply(
                        lambda age: any(
                            min_age <= age <= max_age for min_age, max_age in age_ranges
                        )
                    )
                    filtered_df = filtered_df[age_filter]
                else:
                    # For other demographics, use simple filtering
                    filtered_df = filtered_df[filtered_df[dem].isin(choices[dem])]

        filtered_df.to_csv(self.file_path, index=False)
