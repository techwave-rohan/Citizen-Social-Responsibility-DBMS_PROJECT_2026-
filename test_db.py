import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

conn = mysql.connector.connect(
    host=os.getenv('AUTH_DB_HOST', 'localhost'),
    user=os.getenv('AUTH_DB_USER', 'root'),
    password=os.getenv('AUTH_DB_PASSWORD', 'root'), # Replace if different
    database=os.getenv('AUTH_DB_NAME', 'csr_auth')
)

cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM users_auth WHERE username='999999999999'")
print(cursor.fetchone())

# also check if the password matches
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.verify("password123", cursor.execute("SELECT password_hash FROM users_auth WHERE username='999999999999'") or cursor.fetchone()['password_hash']))
