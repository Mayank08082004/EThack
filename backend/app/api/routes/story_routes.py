from fastapi import APIRouter, HTTPException
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
    sentiment_shifts = analyze_sentiment(articles_text)
    players = extract_players(articles_text)
    contrarian_perspectives = extract_contrarian(articles_text)
    predictions = extract_predictions(articles_text)
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
def chat_with_story(story_id: str, body: StoryChatRequest):
    db = SessionLocal()

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