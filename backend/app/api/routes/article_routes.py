from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.article_schema import ArticleCreate
from app.db.database import SessionLocal
from app.services.embedding import get_embedding
from sqlalchemy import text
from app.services.story_cluster import find_or_create_story, update_story_centroid
from app.services.chatbot import generate_story_chat_reply
import httpx

router = APIRouter()

class ChatHistoryItem(BaseModel):
    role: str
    text: str

class ArticleChatRequest(BaseModel):
    message: str
    article_title: str
    article_content: str
    history: Optional[List[ChatHistoryItem]] = []

class ArticleChatResponse(BaseModel):
    reply: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/add")
def add_article(article: ArticleCreate, db: Session = Depends(get_db)):

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

        update_story_centroid(db, story_id)
        
        db.commit()

        return {
            "message": "Article added successfully",
            "story_id": story_id
        }

    except Exception as e:
        return {"error": str(e)}


@router.post("/chat", response_model=ArticleChatResponse)
def chat_with_article(body: ArticleChatRequest):
    """Chat with Gemini using the article content as direct context. No DB lookup needed."""
    try:
        context = (
            f"Article Title: {body.article_title}\n\n"
            f"Article Content:\n{body.article_content[:4000]}"
        )
        history_payload = [{"role": item.role, "text": item.text} for item in (body.history or [])]
        reply = generate_story_chat_reply(body.message, context, history_payload)
        return ArticleChatResponse(reply=reply)
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail="Gemini API request failed") from error
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail="Gemini API connection error") from error
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error