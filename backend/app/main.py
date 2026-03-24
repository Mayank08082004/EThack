from fastapi import FastAPI
from app.db.database import SessionLocal
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend running"}

@app.get("/test-db")
def test_db():
    db = SessionLocal()
    result = db.execute(text("SELECT 1")).fetchone()
    return {"status": "connected"}