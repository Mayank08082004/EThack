from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from app.services.supabase_client import anon_client, supabase


router = APIRouter()


# ── Request models ──────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


# ── Helpers ─────────────────────────────────────────────────────────────────

def _bearer(authorization: str | None) -> str:
    """Extract and validate Bearer token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ", 1)[1]


def _get_user(token: str):
    """Validate JWT with Supabase and return the user object."""
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
async def signup(body: SignUpRequest):
    """Register a new user with Supabase Auth and create an empty preferences row."""
    try:
        result = anon_client.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {"name": body.name}
            }
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=400, detail=repr(e))

    user = result.user
    session = result.session

    if not user:
        raise HTTPException(status_code=400, detail="Signup failed — check your credentials.")

    # Upsert empty preferences row using service-role client (bypasses RLS)
    supabase.table("user_preferences").upsert({
        "user_id": user.id,
        "genres": []
    }, on_conflict="user_id").execute()

    return {
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name", body.name),
        },
        "has_preferences": False,
    }


@router.post("/signin")
async def signin(body: SignInRequest):
    """Authenticate an existing user and return session tokens."""
    try:
        result = anon_client.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    user = result.user
    session = result.session

    if not user or not session:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Check whether user has saved preferences
    prefs_row = (
        supabase.table("user_preferences")
        .select("genres")
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )
    genres = prefs_row.data.get("genres", []) if prefs_row.data else []

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name", user.email.split("@")[0]),
        },
        "has_preferences": len(genres) > 0,
    }


@router.post("/signout")
async def signout(authorization: str | None = Header(default=None)):
    """Invalidate the current session on Supabase."""
    token = _bearer(authorization)
    try:
        anon_client.auth.admin.sign_out(token)
    except Exception:
        pass  # Best-effort — client-side token deletion is sufficient
    return {"message": "Signed out successfully"}


@router.get("/me")
async def me(authorization: str | None = Header(default=None)):
    """Return the authenticated user's profile and preferences."""
    token = _bearer(authorization)
    user = _get_user(token)

    prefs_row = (
        supabase.table("user_preferences")
        .select("genres, updated_at")
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )
    genres = prefs_row.data.get("genres", []) if prefs_row.data else []

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name", user.email.split("@")[0]),
        },
        "genres": genres,
    }
