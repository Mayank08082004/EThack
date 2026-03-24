from fastapi import APIRouter
from app.db.database import SessionLocal
from sqlalchemy import text
from app.services.summary import generate_summary
from app.services.timeline import extract_timeline
from app.services.title import generate_title
router = APIRouter()

@router.get("/{story_id}")
def get_story(story_id: str):
    db = SessionLocal()

    query = text("""
        SELECT title, content, published_at
        FROM articles
        WHERE story_id = :story_id
        ORDER BY id ASC
    """)

    result = db.execute(query, {"story_id": story_id}).fetchall()

    articles = [
        {
            "title": row[0],
            "content": row[1],
            "published_at": row[2]
        }
        for row in result
    ]
    articles_text = [row[1] for row in result]

    summary = generate_summary(articles_text)
    timeline = extract_timeline(articles_text)
    title = generate_title([a["content"] for a in articles])
    return {
        "story_id": story_id,
        "title": title,
        "total_articles": len(articles),
        "summary": summary,
        "timeline": timeline,
        "articles": articles
    }