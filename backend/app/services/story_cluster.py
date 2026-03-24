from sqlalchemy import text
import uuid

THRESHOLD = 0.5

def find_or_create_story(db, embedding):
    embedding_str = str(embedding)

    # 🔍 Find closest story
    result = db.execute(text("""
        SELECT story_id, centroid <-> (:embedding)::vector AS distance
        FROM stories
        WHERE centroid IS NOT NULL
        ORDER BY centroid <-> (:embedding)::vector
        LIMIT 1
    """), {"embedding": embedding_str}).fetchone()

    # ✅ If match found
    if result and result.distance < THRESHOLD:
        return result.story_id

    # ❌ Create new story
    story_id = str(uuid.uuid4())

    db.execute(text("""
        INSERT INTO stories (story_id, centroid)
        VALUES (:id, (:embedding)::vector)
    """), {
        "id": story_id,
        "embedding": embedding_str
    })

    return story_id

def update_story_centroid(db, story_id):
    result = db.execute(text("""
        SELECT embedding FROM articles
        WHERE story_id = :story_id
    """), {"story_id": story_id}).fetchall()

    if not result:
        return

    import json
    vectors = []
    for row in result:
        val = row[0]
        if isinstance(val, str):
            val = json.loads(val)
        vectors.append(val)

    avg = [sum(col) / len(col) for col in zip(*vectors)]
    avg_str = str(avg)

    db.execute(text("""
        UPDATE stories
        SET centroid = (:embedding)::vector
        WHERE story_id = :id
    """), {
        "embedding": avg_str,
        "id": story_id
    })