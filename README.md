# Citizen Trust Score System

A full-stack web application designed for a government-run Citizen Trust Score Management System. Features four roles (Citizen, Government Official, Analyst, Admin) with corresponding dashboards, secure JWT authentication, and MySQL-backed state connected via FastAPI.

## Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL Server

## Backend Setup (FastAPI)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the `.env` file in the `backend` directory. An example is already provided. Ensure `DB_PASSWORD` matches your local MySQL password.
5. Create a MySQL database and load the required schema. Ensure the database name matches `DB_NAME` in `.env`.
6. Run the FastAPI dev server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

## Frontend Setup (React + Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.


## Full Project youtube video Link : https://youtu.be/7RQXllJ_IWg