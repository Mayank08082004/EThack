from fastapi import APIRouter, Depends, HTTPException, Header
from app.services.supabase_client import supabase
from app.services.scraper_service import scrape_news
from app.services.embedding import get_embedding
from typing import Optional
import time

router = APIRouter()

def log_debug(msg: str):
    with open("auth_debug.log", "a") as f:
        f.write(msg + "\n")
    print(msg)

def get_token(authorization: Optional[str] = Header(None)) -> str:
    log_debug(f"DEBUG get_token: raw authorization header='{authorization}'")
    if not authorization or not authorization.startswith("Bearer "):
        log_debug("DEBUG get_token: Auth header missing or not starting with Bearer")
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    log_debug(f"DEBUG get_token: extracted token='{token[:10]}...'")
    return token

def get_user_id(token: str = Depends(get_token)) -> str:
    log_debug("DEBUG get_user_id: calling supabase.auth.get_user(token)...")
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or getattr(user_response, 'user', None) is None:
            log_debug("DEBUG get_user_id: user_response empty or missing user")
            raise HTTPException(status_code=401, detail="Invalid session")
        log_debug(f"DEBUG get_user_id: valid user {user_response.user.id}")
        return user_response.user.id
    except Exception as e:
        log_debug(f"DEBUG get_user_id EXCEPTION: {repr(e)}")
        raise HTTPException(status_code=401, detail=str(e))

@router.get("")
def get_personalized_news(user_id: str = Depends(get_user_id)):
    """Fetch news from the database that matches the user's preferences."""
    try:
        # Get user preferences
        prefs_res = supabase.table("user_preferences").select("genres").eq("user_id", user_id).single().execute()
        genres = prefs_res.data.get("genres", []) if prefs_res.data else []
        
        # If no preferences, just fetch latest general news
        if not genres:
            result = supabase.table("news").select("*").order("published_at", desc=True).limit(20).execute()
        else:
            # Postgres supports array overlap & operator, but Supabase SDK doesn't natively expose overlaps easily in standard query
            # We can use the .contains or we can just fetch all and filter in python, or use .filter("genres", "cs", f"{{{','.join(genres)}}}")
            # Supabase overlaps is usually .ov("genres", genres)
            result = supabase.table("news").select("*").ov("genres", genres).order("published_at", desc=True).limit(20).execute()
            
            if not result.data:
                # Fallback to general news if no strictly merged news
                result = supabase.table("news").select("*").order("published_at", desc=True).limit(10).execute()
        
        return result.data
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

@router.post("/sync")
def sync_news(user_id: str = Depends(get_user_id)):
    """Trigger the scraper for the user's preferences, generate embeddings, and save to DB."""
    try:
        # Get user preferences
        prefs_res = supabase.table("user_preferences").select("genres").eq("user_id", user_id).single().execute()
        genres = prefs_res.data.get("genres", []) if prefs_res.data else []

        scraped_articles = scrape_news(requested_genres=genres, fallback_keywords=genres)
        
        if not scraped_articles:
            return {"message": "Sync complete", "new_articles": 0, "total_scraped": 0}

        # 1. Batch fetch existing links with retries
        links = [a["link"] for a in scraped_articles]
        existing_links = set()
        max_retries = 3

        for i in range(0, len(links), 50):
            chunk = links[i:i+50]
            for attempt in range(max_retries):
                try:
                    res = supabase.table("news").select("link").in_("link", chunk).execute()
                    if res.data:
                        existing_links.update([r["link"] for r in res.data])
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        print(f"Failed to fetch existing links chunk: {e}")
                    time.sleep(1 * (attempt + 1))

        # 2. Filter and generate embeddings
        new_articles_data = []
        for article in scraped_articles:
            if article["link"] in existing_links:
                continue
                
            embedding = get_embedding(article["content"][:8000]) # Cap to avoid token limits
            
            new_articles_data.append({
                "title": article["title"],
                "description": article["description"],
                "content": article["content"],
                "image": article["image"],
                "link": article["link"],
                "source": article["source"],
                "genres": article["genres"],
                "embedding": embedding
            })
            
        # 3. Batch Insert with retries
        inserted_count = 0
        if new_articles_data:
            for i in range(0, len(new_articles_data), 10):
                chunk = new_articles_data[i:i+10]
                for attempt in range(max_retries):
                    try:
                        supabase.table("news").insert(chunk).execute()
                        inserted_count += len(chunk)
                        break
                    except Exception as e:
                        if attempt == max_retries - 1:
                            print(f"Failed to insert batch: {e}")
                        time.sleep(1 * (attempt + 1))
            
        return {"message": "Sync complete", "new_articles": inserted_count, "total_scraped": len(scraped_articles)}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
