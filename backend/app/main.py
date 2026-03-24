from fastapi import FastAPI
from app.db.database import SessionLocal
from sqlalchemy import text

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend running"}

@app.get("/test-db")
def test_db():
    db = SessionLocal()
    result = db.execute(text("SELECT 1")).fetchone()
    return {"status": "connected"}