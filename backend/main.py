from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, citizen, official, analyst, admin

app = FastAPI(title="Citizen Trust Score Management System API")

# Configure CORS - allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(citizen.router)
app.include_router(official.router)
app.include_router(analyst.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Citizen Trust Score API"}
