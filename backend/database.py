import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Rk@@1234")
DB_NAME = os.getenv("DB_NAME", "csr_db")

AUTH_DB_HOST = os.getenv("AUTH_DB_HOST", "localhost")
AUTH_DB_PORT = os.getenv("AUTH_DB_PORT", "3306")
AUTH_DB_USER = os.getenv("AUTH_DB_USER", "root")
AUTH_DB_PASSWORD = os.getenv("AUTH_DB_PASSWORD", "Rk@@1234")
AUTH_DB_NAME = os.getenv("AUTH_DB_NAME", "csr_auth")

dbconfig = {
    "host": DB_HOST,
    "port": DB_PORT,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
}

auth_dbconfig = {
    "host": AUTH_DB_HOST,
    "port": AUTH_DB_PORT,
    "user": AUTH_DB_USER,
    "password": AUTH_DB_PASSWORD,
    "database": AUTH_DB_NAME,
}


try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        pool_reset_session=True,
        **dbconfig
    )
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    connection_pool = None

try:
    auth_connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="authpool",
        pool_size=5,
        pool_reset_session=True,
        **auth_dbconfig
    )
except mysql.connector.Error as err:
    print(f"Error creating auth connection pool: {err}")
    auth_connection_pool = None

def get_db_connection():
    if not connection_pool:
        raise Exception("Database connection pool is not available.")
    return connection_pool.get_connection()

def get_auth_db_connection():
    if not auth_connection_pool:
        raise Exception("Auth Database connection pool is not available.")
    return auth_connection_pool.get_connection()
