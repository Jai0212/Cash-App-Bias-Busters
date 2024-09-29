import psycopg2
from psycopg2 import sql
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

uid = str(uuid.uuid4())

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

columns = [
    sql.SQL("SELECT * FROM CashApp_Data")
]

print(columns)