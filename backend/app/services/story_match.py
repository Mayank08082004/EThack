from sqlalchemy import text
import uuid

THRESHOLD = 0.3  # tune this later

def find_or_create_story(db, embedding):
    query = text("""
        SELECT story_id, embedding <-> :embedding AS distance
        FROM articles
        ORDER BY embedding <-> :embedding
        LIMIT 1
    """)

    result = db.execute(query, {"embedding": embedding}).fetchone()

    # If similar story exists
    if result and result.distance < THRESHOLD:
        return result.story_id

    # Else create new story
    return str(uuid.uuid4())