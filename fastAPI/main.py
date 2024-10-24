from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import subprocess
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import mysql.connector
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId


app = FastAPI()

# Database connections
mongo_client = AsyncIOMotorClient("mongodb://localhost:27017")
mongo_db = mongo_client["sms_config"]

mysql_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="aryaman123",
    database="sms_metrics"
)

origins = [
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['GET','POST','PUT','DELETE'],
    allow_headers = ["*"]
)
# JWT settings
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class User(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    password: Optional[str] = None  

class UserInDB(User):
    hashed_password: str  # Typically you would store the hashed version

    class Config:
        orm_mode = True
        allow_population_by_field_name = True       

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CountryOperator(BaseModel):
    country: str
    operator: str
    is_high_priority: bool = False

class SMSMetrics(BaseModel):
    country: str
    operator: str
    sent: int
    success: int
    failure: int

# Utility Functions
async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(username: str):
    user = await mongo_db.users.find_one({"username": username})
    if user:
        return {
            "id": str(user["_id"]),
            "username": user["username"],
            "email":user["email"],
            "hashed_password": user["hashed_password"],
        }
    return None

async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user or not await verify_password(password, user["hashed_password"]):
        return False
    return UserInDB(**user) 

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = await get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Signup API
@app.post("/signup")
async def signup(user: User):
    if await get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = pwd_context.hash(user.password)
    user_data = user.dict(exclude={"password"})
    user_data["hashed_password"] = hashed_password
    await mongo_db.users.insert_one(user_data)
    return {"message": "User created successfully"}

@app.post("/signout")
async def signout(res:Response,current_user: User = Depends(get_current_active_user)):
    # Delete the user from the database
    result = await mongo_db.users.delete_one({"username": current_user.username})
    if result.deleted_count == 1:
        # Invalidate token on the client side by removing it from cookies
        res.delete_cookie(key="access_token")
        return {"msg": "Successfully signed out and user deleted from the database."}
    else:
        raise HTTPException(status_code=404, detail="User not found")

# Login API (using cookies for token)
@app.post("/token", response_model=Token)
async def login_for_access_token(res: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)

    # Set the JWT token in an HTTP-only cookie
    res.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Logout API (clearing the token)
@app.post("/logout")
async def logout(res: Response, current_user: User = Depends(get_current_active_user)):
    res.delete_cookie(key="access_token")
    return {"message": "User logged out successfully"}

# Protected route
@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# The below FastAPI endpoint definition for start_session is responsible for initiating a new background session using the screen command in a Unix-like operating system.
# Process Management
@app.post("/start_session/{country}/{operator}")
async def start_session(country: str, operator: str, current_user: User = Depends(get_current_active_user)):
    session_name = f"program_{country}_{operator}"
    subprocess.run(["screen", "-dmS", session_name, "python", f"sms_program_{country}_{operator}.py"])
    return {"message": f"Started session for {country} - {operator}"}

@app.post("/stop_session/{country}/{operator}")
async def stop_session(country: str, operator: str, current_user: User = Depends(get_current_active_user)):
    session_name = f"program_{country}_{operator}"
    subprocess.run(["screen", "-S", session_name, "-X", "quit"])
    return {"message": f"Stopped session for {country} - {operator}"}

# Real-Time Metrics
@app.get("/metrics/{country}")
async def get_metrics(country: str, current_user: User = Depends(get_current_active_user)):
    cursor = mysql_connection.cursor()
    query = "SELECT * FROM sms_metrics WHERE country = %s"
    cursor.execute(query, (country,))
    result = cursor.fetchall()
    cursor.close()
    return [SMSMetrics(country=row[0], operator=row[1], sent=row[2], success=row[3], failure=row[4]) for row in result]

# Country-Operator Management
@app.post("/country_operator")
async def add_country_operator(country_operator: CountryOperator, current_user: User = Depends(get_current_active_user)):
    await mongo_db.country_operators.insert_one(country_operator.dict())
    return {"message": "Country-Operator pair added successfully"}

@app.get("/country_operators")
async def get_country_operators(current_user: User = Depends(get_current_active_user)):
    country_operators_cursor = await mongo_db.country_operators.find().to_list(length=100)
    country_operators = [
        {
            "id": str(operator["_id"]),  # Convert ObjectId to string
            "country": operator["country"],
            "operator": operator["operator"],
            "is_high_priority": operator["is_high_priority"]
        } for operator in country_operators_cursor
    ]
    return country_operators   

@app.put("/country_operator/{operator_id}")
async def update_country_operator(operator_id: str, country_operator: CountryOperator, current_user: User = Depends(get_current_active_user)):
    result = await mongo_db.country_operators.update_one(
        {"_id": ObjectId(operator_id)}, 
        {"$set": country_operator.dict()}
    )
    if result.modified_count == 1:
        return {"message": "Country-Operator pair updated successfully"}
    return {"message": "No changes made or country-operator not found"}

@app.delete("/country_operator/{operator_id}")
async def delete_country_operator(operator_id: str, current_user: User = Depends(get_current_active_user)):
    result = await mongo_db.country_operators.delete_one({"_id": ObjectId(operator_id)})
    if result.deleted_count == 1:
        return {"message": "Country-Operator pair deleted successfully"}
    return {"message": "Country-Operator pair not found"}


# Main application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Starting a Background Process:

# subprocess.run(...) is used to execute a shell command:
# screen: A terminal multiplexer that allows you to run multiple terminal sessions in a single window or detach them and reattach later.
# -dmS: This option tells screen to start a new session (-d) in detached mode (-m) and give it a name (-S) specified by session_name.
# python: This indicates that a Python script is to be run.
# sms_program_{country}_{operator}.py: This is the name of the Python script that will be executed. It is dynamically created based on the country and operator parameters.