import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# override=True ensures .env ALWAYS wins over any stale OS-level env vars
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # auto-reconnect on stale connections
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()