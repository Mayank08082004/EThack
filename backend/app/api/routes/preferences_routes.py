from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List
from app.services.supabase_client import supabase

router = APIRouter()


class PreferencesRequest(BaseModel):
    genres: List[str]


def _get_user_id(authorization: str | None) -> str:
    """Validate Bearer token and return the Supabase user ID."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("")
async def get_preferences(authorization: str | None = Header(default=None)):
    """Return the authenticated user's saved genre preferences."""
    user_id = _get_user_id(authorization)

    result = (
        supabase.table("user_preferences")
        .select("genres, updated_at")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        return {"genres": [], "updated_at": None}

    return {
        "genres": result.data.get("genres", []),
        "updated_at": result.data.get("updated_at"),
    }


@router.put("")
async def save_preferences(
    body: PreferencesRequest,
    authorization: str | None = Header(default=None),
):
    """Save (upsert) the authenticated user's genre preferences."""
    user_id = _get_user_id(authorization)

    result = (
        supabase.table("user_preferences")
        .upsert(
            {"user_id": user_id, "genres": body.genres, "updated_at": "now()"},
            on_conflict="user_id",
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save preferences")

    return {"genres": result.data[0].get("genres", body.genres)}
