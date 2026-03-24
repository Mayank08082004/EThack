from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.embedding import get_embedding
from sqlalchemy import text

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search")
def search_story(query: str, db: Session = Depends(get_db)):
    embedding = get_embedding(query)

    result = db.execute(text("""
        SELECT story_id
        FROM articles
        ORDER BY embedding <-> CAST(:embedding AS vector)
        LIMIT 1
    """), {"embedding": embedding}).fetchone()

    if not result:
        return {"error": "No story found"}

    return {"story_id": result[0]}