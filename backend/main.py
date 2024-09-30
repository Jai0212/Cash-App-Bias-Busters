from dotenv import load_dotenv
import os
import mysql.connector
import tempfile

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_CERTIFICATE = os.getenv("DB_CERTIFICATE")
DB_PORT = os.getenv("DB_PORT")

with tempfile.NamedTemporaryFile(delete=False) as temp_cert:
    temp_cert.write(DB_CERTIFICATE.encode())
    temp_cert_path = temp_cert.name


connection = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_DATABASE,
    port=DB_PORT,
    ssl_verify_cert=True,
    ssl_ca=temp_cert_path
)

cursor = connection.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS cashapp_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
    )
""")
connection.commit()  # Ensure the table creation is committed
print("Table created successfully")

cursor.close()
connection.close()

os.remove(temp_cert_path)
