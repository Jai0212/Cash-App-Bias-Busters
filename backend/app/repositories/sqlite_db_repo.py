# /app/repositories/sqlite_db_repo.py

from app.repositories.interfaces import DatabaseRepositoryInterface
from app.infrastructure.db_connection_manager import DbConnectionManager
from app.entities.user import User
import mysql.connector
from mysql.connector import Error
from typing import Optional


class SqliteDbRepo(DatabaseRepositoryInterface):
    def __init__(self, user: User):
        self.connection = None
        
        self.user = user
        self.table_name = user.table_name

    def connect(self):
        self.connection = DbConnectionManager.get_connection()

    def see_all_tables(self) -> None:
        """See all tables in the database and return them as DatabaseTable objects."""

        self.connect()

        try:
            if self.connection is None:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print("Tables in the database:")

            for table in tables:
                # Assuming DatabaseTable class has a constructor to accept a table name
                print(table[0])

            cursor.close()

        except Error as e:
            print(f"Error: {e}")

    def create_table(self) -> None:
        """Create a table in SQLite database"""

        self.connect()

        sanitized_table_name = (
            f"`{self.table_name}`"  # Backticks allow special characters
        )

        try:
            if self.connection is None:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()

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

            cursor.close()

        except Error as e:
            print(f"Error: {e}")

    def delete_table(self) -> None:
        """delete a table"""

        self.connect()

        try:
            if self.connection is None:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()
            cursor.execute(f"DROP TABLE IF EXISTS `{self.table_name}`")
            print("Table deleted successfully.")

            cursor.close()

        except Error as e:
            print(f"Error: {e}")

    def fetch_data(self, p=False) -> tuple[list[str], tuple[str, ...]]:
        """Get data for the table"""

        self.connect()

        try:
            if self.connection is None:
                print("Not connected to the database.")
                return [], []

            cursor = self.connection.cursor()

            cursor.execute(f"SELECT * FROM `{self.table_name}`")
            results = cursor.fetchall()

            # Fetching the column headers
            headers = [desc[0] for desc in cursor.description]

            if results:
                print(f"Data fetched from {self.table_name}:")
                print(headers)
                
                if p:
                    for row in results:
                        print(row)
                return headers, results
            else:
                print("No data found.")
                return headers, []

        except Error as e:
            print(f"Error: {e}")
            return [], []

    def update_db_for_user(
        self,
        demographics: list[str],
        choices: dict[str, list[str]],
        time: str,
    ) -> None:
        """Update the database for the specified user with the selected demographics and choices."""

        self.connect()

        try:
            if self.connection is None:
                print("Not connected to the database.")
                return

            cursor = self.connection.cursor()

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
            parameters.append(self.table_name)

            # Construct the final SQL query
            sql_query = f"""
            UPDATE users
            SET {', '.join(set_clauses)}
            WHERE {where_clause}
            """

            set(sql_query)

            # Execute the update query
            cursor.execute(sql_query, tuple(parameters))
            self.connection.commit()
            print("User data updated successfully.")
            cursor.close()

        except Error as err:
            print(f"Error: {err}")

    def get_last_login_data(
        self,
    ) -> tuple[Optional[list[str]], Optional[dict[str, list[str]]], Optional[str]]:
        """Retrieve the last login demographics and choices for the specified user."""

        self.connect()

        demographics = []
        choices = {}
        try:
            if self.connection is None:
                print("Not connected to the database.")
                return None, None, None

            cursor = self.connection.cursor()

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
                (self.table_name,),
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

                cursor.close()
                return list(set(demographics)), choices, time
            else:
                print("No data found for the specified user.")
                cursor.close()
                return None, None, None

        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return None, None, None
