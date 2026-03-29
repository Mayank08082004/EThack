from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from sqlalchemy import text
from app.services.summary import generate_summary
from app.services.timeline import extract_timeline
from app.services.title import generate_title
from app.services.sentiment import analyze_sentiment
from app.services.players import extract_players
from app.services.contrarian import extract_contrarian
from app.services.predictions import extract_predictions
from app.services.chatbot import generate_story_chat_reply
from app.schemas.chat_schema import StoryChatRequest, StoryChatResponse
from app.services.embedding import get_embedding
import httpx
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{story_id}")
def get_story(story_id: str, db: Session = Depends(get_db)):

    query = text("""
        SELECT title, content, published_at, image, source
        FROM articles
        WHERE story_id = :story_id
        ORDER BY id ASC
    """)

    result = db.execute(query, {"story_id": story_id}).fetchall()

    articles = [
        {
            "title": row[0],
            "content": row[1],
            "published_at": row[2].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row[2], 'strftime') else str(row[2]) if row[2] else None,
            "image": row[3],
            "source": row[4]
        }
        for row in result
    ]
    
    # Inject exact dates and titles into the text payload so the LLM doesn't hallucinate timelines
    articles_text = [f"Date: {row[2]}\nTitle: {row[0]}\nContent: {row[1]}" for row in result]

    from concurrent.futures import ThreadPoolExecutor
    
    # Run all 7 LLM intelligence extractors concurrently to make the page lively (~3s instead of ~21s)
    with ThreadPoolExecutor(max_workers=7) as executor:
        f_summary = executor.submit(generate_summary, articles_text)
        f_timeline = executor.submit(extract_timeline, articles_text)
        f_title = executor.submit(generate_title, [a["content"] for a in articles])
        f_sentiment = executor.submit(analyze_sentiment, articles_text)
        f_players = executor.submit(extract_players, articles_text)
        f_contrarian = executor.submit(extract_contrarian, articles_text)
        f_predictions = executor.submit(extract_predictions, articles_text)
        
        summary = f_summary.result()
        timeline = f_timeline.result()
        title = f_title.result()
        sentiment_shifts = f_sentiment.result()
        players = f_players.result()
        contrarian_perspectives = f_contrarian.result()
        predictions = f_predictions.result()
    
    return {
        "story_id": story_id,
        "title": title,
        "total_articles": len(articles),
        "summary": summary,
        "timeline": timeline,
        "sentiment_shifts": sentiment_shifts,
        "contrarian_perspectives": contrarian_perspectives,
        "players": players,
        "predictions": predictions,
        "articles": articles
    }


@router.post("/{story_id}/chat", response_model=StoryChatResponse)
def chat_with_story(story_id: str, body: StoryChatRequest, db: Session = Depends(get_db)):

    try:
        query_embedding = get_embedding(body.message)
        query_embedding_str = str(query_embedding)

        query = text(
            """
            SELECT title, content, embedding <-> CAST(:embedding AS vector) AS distance
            FROM articles
            WHERE story_id = :story_id
            ORDER BY embedding <-> CAST(:embedding AS vector)
            LIMIT 6
        """
        )

        result = db.execute(
            query,
            {"story_id": story_id, "embedding": query_embedding_str},
        ).fetchall()

        if not result:
            raise HTTPException(status_code=404, detail="Story not found")

        context_chunks = []
        for index, row in enumerate(result, start=1):
            title = row[0] or "Untitled"
            content = (row[1] or "")[:1200]
            distance = row[2]
            context_chunks.append(
                f"Relevant Article {index} (distance={distance:.4f}): {title}\n{content}"
            )

        story_context = "\n\n".join(context_chunks)

        history_payload = [{"role": item.role, "text": item.text} for item in body.history]

        reply = generate_story_chat_reply(body.message, story_context, history_payload)
    except ValueError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail="Gemini API request failed") from error
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail="Gemini API connection error") from error
    finally:
        db.close()

    return StoryChatResponse(reply=reply)