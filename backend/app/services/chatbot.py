import os
from typing import Sequence

import httpx


def generate_story_chat_reply(
    user_message: str,
    story_context: str,
    history: Sequence[dict[str, str]] | None = None,
) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent"
    )

    conversation_context = ""
    if history:
        recent_history = history[-8:]
        formatted = []
        for item in recent_history:
            role = item.get("role", "user").strip().lower()
            text = (item.get("text", "") or "").strip()
            if not text:
                continue
            speaker = "User" if role == "user" else "Assistant"
            formatted.append(f"{speaker}: {text}")

        if formatted:
            conversation_context = "\n".join(formatted)

    prompt = (
        "You are a business news story assistant for a Story Tracker app. "
        "Answer only from the provided story context. "
        "If context is insufficient, clearly say so in one line.\n\n"
        f"Recent conversation (for follow-up understanding):\n{conversation_context or 'None'}\n\n"
        f"Story context:\n{story_context}\n\n"
        f"User question: {user_message}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 300
        }
    }

    response = httpx.post(
        endpoint,
        params={"key": api_key},
        json=payload,
        timeout=30.0,
    )
    response.raise_for_status()

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return "I could not generate a response right now."

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if part.get("text")]
    reply = "\n".join(text_parts).strip()

    return reply or "I could not generate a response right now."
