from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import os
from database import get_db_connection, get_auth_db_connection
from schemas import Token, TokenData, CitizenCreate, OfficialCreate, AdminCreate

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-just-in-case")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")
        role: str = payload.get("role")
        if identifier is None or role is None:
            raise credentials_exception
        token_data = TokenData(id=identifier, role=role)
    except JWTError:
        raise credentials_exception
    return token_data

# Role-based dependency injection generators
def role_required(required_role: str):
    def role_checker(current_user: TokenData = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail=f"Permission denied, requires {required_role} role")
        return current_user
    return role_checker

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    auth_conn = get_auth_db_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check Admin First (Hardcoded or in DB - assuming hardcoded for simplicity)
        if form_data.username == "admin@gov.in" and form_data.password == "admin123":
            access_token = create_access_token(data={"sub": form_data.username, "role": "admin"})
            return {"access_token": access_token, "token_type": "bearer", "role": "admin", "user_id": 0}

        # 1. Look up user in csr_auth by username
        auth_cursor.execute("SELECT user_id, username, password_hash, status FROM users_auth WHERE username = %s", (form_data.username,))
        auth_user = auth_cursor.fetchone()
        
        if not auth_user:
            raise HTTPException(status_code=400, detail="Incorrect username or password")
            
        if auth_user['status'] != 'active':
            raise HTTPException(status_code=400, detail="User account is not active")

        # 2. Verify hashed password
        if not verify_password(form_data.password, auth_user['password_hash']):
            raise HTTPException(status_code=400, detail="Incorrect username or password")
            
        # 3. Look up roles
        auth_cursor.execute("SELECT role FROM user_roles WHERE user_id = %s", (auth_user['user_id'],))
        role_record = auth_cursor.fetchone()
        
        if not role_record:
            raise HTTPException(status_code=400, detail="User has no assigned role")
            
        role_type = role_record['role']
        app_user_id = 0
        
        # 4. Query application specific details from csr_db
        if role_type == "citizen":
            cursor.execute("SELECT CitizenID FROM citizen WHERE AadhaarNumber = %s", (form_data.username,))
            citizen = cursor.fetchone()
            if not citizen:
                raise HTTPException(status_code=400, detail="Citizen profile not found")
            app_user_id = citizen['CitizenID']
        elif role_type in ["official", "analyst"]:
            cursor.execute("SELECT OfficialID FROM government_official WHERE Email = %s", (form_data.username,))
            official = cursor.fetchone()
            if not official:
                raise HTTPException(status_code=400, detail="Official profile not found")
            app_user_id = official['OfficialID']
            
        # 5. Issue token
        access_token = create_access_token(data={"sub": form_data.username, "role": role_type, "user_id": app_user_id})
        return {"access_token": access_token, "token_type": "bearer", "role": role_type, "user_id": app_user_id}
            
    finally:
        auth_cursor.close()
        auth_conn.close()
        cursor.close()
        conn.close()

@router.post("/register")
async def register_citizen(citizen: CitizenCreate):
    auth_conn = get_auth_db_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if AadhaarNumber already exists in application schema
        cursor.execute("SELECT CitizenID FROM citizen WHERE AadhaarNumber = %s", (citizen.AadhaarNumber,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Aadhaar already registered in citizen database")
            
        # Check if username exists in auth schema
        auth_cursor.execute("SELECT user_id FROM users_auth WHERE username = %s", (citizen.AadhaarNumber,))
        if auth_cursor.fetchone():
            raise HTTPException(status_code=400, detail="Aadhaar already registered in auth database")
            
        # 1. Insert into auth database
        auth_cursor.execute(
            "INSERT INTO users_auth (username, password_hash) VALUES (%s, %s)",
            (citizen.AadhaarNumber, get_password_hash(citizen.Password))
        )
        new_auth_user_id = auth_cursor.lastrowid
        
        auth_cursor.execute(
            "INSERT INTO user_roles (user_id, role) VALUES (%s, %s)",
            (new_auth_user_id, 'citizen')
        )
            
        # 2. Insert into application schema
        age_group_id = citizen.AgeGroupID
        if not age_group_id:
            age_group_id = 2 # Assuming ID 2 is adult as per DB default
            
        insert_query = """
            INSERT INTO citizen (AadhaarNumber, FirstName, LastName, DOB, City, ContactNo, CurrentScore, AgeGroupID)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        initial_score = 100.0 # Starting score
        
        cursor.execute(insert_query, (
            citizen.AadhaarNumber,
            citizen.FirstName,
            citizen.LastName,
            citizen.DateOfBirth,
            citizen.City,
            citizen.ContactNo,
            initial_score,
            age_group_id
        ))
        auth_conn.commit()
        conn.commit()
        return {"message": "Citizen registered successfully"}
        
    except Exception as e:
        auth_conn.rollback()
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        auth_cursor.close()
        auth_conn.close()
        cursor.close()
        conn.close()

@router.post("/register/official")
async def register_official(official: OfficialCreate):
    auth_conn = get_auth_db_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if Email already exists in application schema
        cursor.execute("SELECT OfficialID FROM government_official WHERE Email = %s", (official.Email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered in official database")
            
        # Check if username exists in auth schema
        auth_cursor.execute("SELECT user_id FROM users_auth WHERE username = %s", (official.Email,))
        if auth_cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered in auth database")
            
        # 1. Insert into auth database
        auth_cursor.execute(
            "INSERT INTO users_auth (username, password_hash) VALUES (%s, %s)",
            (official.Email, get_password_hash(official.Password))
        )
        new_auth_user_id = auth_cursor.lastrowid
        
        # Determine actual role (based on Designation)
        assigned_role = 'analyst' if 'analyst' in official.Designation.lower() else 'official'
        
        auth_cursor.execute(
            "INSERT INTO user_roles (user_id, role) VALUES (%s, %s)",
            (new_auth_user_id, assigned_role)
        )
            
        # 2. Insert into application schema
        insert_query = """
            INSERT INTO government_official (FirstName, LastName, Designation, Email, DepartmentID)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            official.FirstName,
            official.LastName,
            official.Designation,
            official.Email,
            official.DepartmentID
        ))
        auth_conn.commit()
        conn.commit()
        return {"message": f"{assigned_role.capitalize()} registered successfully"}
        
    except Exception as e:
        auth_conn.rollback()
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        auth_cursor.close()
        auth_conn.close()
        cursor.close()
        conn.close()

@router.post("/register/admin")
async def register_admin(admin: AdminCreate):
    auth_conn = get_auth_db_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)
    
    try:
        # Check if username exists in auth schema
        auth_cursor.execute("SELECT user_id FROM users_auth WHERE username = %s", (admin.Email,))
        if auth_cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered as admin")
            
        # Insert into auth database
        auth_cursor.execute(
            "INSERT INTO users_auth (username, password_hash) VALUES (%s, %s)",
            (admin.Email, get_password_hash(admin.Password))
        )
        new_auth_user_id = auth_cursor.lastrowid
        
        auth_cursor.execute(
            "INSERT INTO user_roles (user_id, role) VALUES (%s, %s)",
            (new_auth_user_id, 'admin')
        )
        
        auth_conn.commit()
        return {"message": "Admin registered successfully"}
        
    except Exception as e:
        auth_conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        auth_cursor.close()
        auth_conn.close()

@router.get("/me")
def get_my_profile(current_user: TokenData = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        role = current_user.role
        identifier = current_user.id
        
        if role == "admin":
            return {"Role": "admin", "Email": identifier, "Profile": {"FirstName": "System", "LastName": "Administrator"}}
            
        elif role == "citizen":
            cursor.execute("SELECT * FROM citizen WHERE AadhaarNumber = %s", (identifier,))
            citizen = cursor.fetchone()
            if not citizen:
                raise HTTPException(status_code=404, detail="Profile not found")
            
            # Remove sensitive data like password if any stored here (though it's in auth db)
            return {"Role": "citizen", "Profile": citizen}
            
        elif role in ["official", "analyst"]:
            cursor.execute("""
                SELECT o.*, d.DepartmentName 
                FROM government_official o
                LEFT JOIN department d ON o.DepartmentID = d.DepartmentID
                WHERE o.Email = %s
            """, (identifier,))
            official = cursor.fetchone()
            if not official:
                raise HTTPException(status_code=404, detail="Profile not found")
            return {"Role": role, "Profile": official}
            
        else:
            raise HTTPException(status_code=400, detail="Unknown role")
            
    finally:
        cursor.close()
        conn.close()
