from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.embedding import get_embedding
from sqlalchemy import text
from app.services.scraper_service import scrape_news
from app.services.story_cluster import find_or_create_story, update_story_centroid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search")
def search_story(query: str, db: Session = Depends(get_db)):
    # 1. Scrape real news from RSS feeds using keyword-llm mapping logic
    scraped_articles = scrape_news([query])
    
    # 2. Get embedding for query to determine semantic similarity
    query_embedding = get_embedding(query)

    if scraped_articles:
        # Find closely related story cluster or make a new one
        story_id = find_or_create_story(db, query_embedding)
        
        # Insert scraped articles
        for article in scraped_articles:
            # Check if article title already exists in this story
            existing = db.execute(
                text("SELECT id FROM articles WHERE title = :title AND story_id = :story_id"), 
                {"title": article["title"], "story_id": story_id}
            ).fetchone()
            
            if not existing:
                art_emb = get_embedding(article["content"][:8000])
                
                # Check for publication date fallback
                pub_val = f"'{article['published_at']}'" if article.get("published_at") else "NOW()"

                db.execute(text(f"""
                    INSERT INTO articles (title, content, embedding, story_id, image, source, published_at)
                    VALUES (:title, :content, (:embedding)::vector, :story_id, :image, :source, {pub_val})
                """), {
                    "title": article["title"],
                    "content": article["content"],
                    "embedding": str(art_emb),
                    "story_id": story_id,
                    "image": article.get("image"),
                    "source": article.get("source")
                })
        
        # Recalculate story centroid
        update_story_centroid(db, story_id)
        db.commit()
        
        return {"story_id": story_id}

    # 3. Fallback: If no live news, use history
    result = db.execute(text("""
        SELECT story_id
        FROM articles
        ORDER BY embedding <-> CAST(:embedding AS vector)
        LIMIT 1
    """), {"embedding": str(query_embedding)}).fetchone()

    if not result:
        return {"error": "No story found"}

    return {"story_id": result[0]}