from sqlalchemy import text

def find_similar_articles(db, embedding):
    query = text("""
        SELECT id, story_id
        FROM articles
        ORDER BY embedding <-> :embedding
        LIMIT 1
    """)

    result = db.execute(query, {"embedding": embedding}).fetchone()
    return result