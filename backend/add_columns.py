import sys
import os

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from sqlalchemy import text

db = SessionLocal()
try:
    print("Executing ALTER TABLE statements...")
    db.execute(text("ALTER TABLE articles ADD COLUMN IF NOT EXISTS image TEXT;"))
    db.execute(text("ALTER TABLE articles ADD COLUMN IF NOT EXISTS source TEXT;"))
    db.commit()
    print("Schema updated successfully! Added 'image' and 'source' columns to 'articles' table.")
except Exception as e:
    db.rollback()
    print("Failed via SessionLocal. Trying raw engine connection...")
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE articles ADD COLUMN IF NOT EXISTS image TEXT;"))
            conn.execute(text("ALTER TABLE articles ADD COLUMN IF NOT EXISTS source TEXT;"))
            conn.commit()
        print("Schema updated successfully via direct engine connection!")
    except Exception as e2:
        print(f"CRITICAL ERROR modifying schema: {e2}")
