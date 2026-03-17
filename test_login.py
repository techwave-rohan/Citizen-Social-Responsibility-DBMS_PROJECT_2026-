import mysql.connector
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv('backend/.env')

conn = mysql.connector.connect(
    host=os.getenv('AUTH_DB_HOST', 'localhost'),
    user=os.getenv('AUTH_DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD'), # using DB_PASSWORD for both
    database=os.getenv('AUTH_DB_NAME', 'csr_auth')
)

cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM users_auth WHERE username='999999999999'")
user = cursor.fetchone()
print("User found:", user)

if user:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    is_valid = pwd_context.verify("password123", user['password_hash'])
    print("Password valid?", is_valid)
