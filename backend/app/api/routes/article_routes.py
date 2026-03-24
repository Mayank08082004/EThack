from fastapi import APIRouter
from app.schemas.article_schema import ArticleCreate
from app.db.database import SessionLocal
from app.services.embedding import get_embedding
from app.services.story_match import find_or_create_story
from sqlalchemy import text

router = APIRouter()

@router.post("/add")
def add_article(article: ArticleCreate):
    db = SessionLocal()

    try:
        # 🧠 STEP 1 — Generate embedding
        embedding = get_embedding(article.content)

        # 🧠 STEP 2 — Find or create story
        story_id = find_or_create_story(db, embedding)

        # 🧠 STEP 3 — Store article
        query = text("""
            INSERT INTO articles (title, content, embedding, story_id)
            VALUES (:title, :content, :embedding, :story_id)
        """)

        db.execute(query, {
            "title": article.title,
            "content": article.content,
            "embedding": embedding,
            "story_id": story_id
        })

        db.commit()

        return {
            "message": "Article added successfully",
            "story_id": story_id
        }

    except Exception as e:
        return {"error": str(e)}