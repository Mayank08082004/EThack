from fastapi import FastAPI
from app.db.database import SessionLocal
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import article_routes, story_routes
from app.api.routes.search_routes import router as search_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(article_routes.router, prefix="/articles")
app.include_router(story_routes.router, prefix="/stories")
app.include_router(search_router)
@app.get("/")
def root():
    return {"message": "Backend running"}

@app.get("/test-db")
def test_db():
    db = SessionLocal()
    result = db.execute(text("SELECT 1")).fetchone()
    return {"status": "connected"}