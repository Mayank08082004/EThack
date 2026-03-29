import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# We use the official Gemini OpenAI-compatible endpoint
client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.getenv("GEMINI_API_KEY"),
)

def get_trending_keywords(genres: list[str], fallback_keywords: list[str] | None = None) -> list[str]:
    """Uses a small, fast Gemini language model to fetch 10-15 trending keywords based on broad preferences.
    
    If the LLM fails, returns `fallback_keywords` if provided, otherwise falls back to the raw genres list.
    """
    if not genres:
        return fallback_keywords or []
        
    prompt = f"""
    You are an expert news editor. The user wants news about the following domains: {', '.join(genres)}.
    Based on CURRENT trending news, generate a JSON array of specific, high-priority keywords or entities (e.g. people, companies, acronyms) relevant right now.
    Return ONLY a valid JSON array of strings (minimum 5, maximum 15), with no markdown backticks and no extra text.
    Example: ["OpenAI", "Nvidia", "Inflation", "IPO", "Federal Reserve"]
    """
    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash", # Official Gemini model name
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content.strip()
        
        # Clean up possible markdown code blocks
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        keywords = json.loads(content.strip())
        print(f"LLM Generated Keywords for {genres}: {keywords}")
        return [str(k).lower() for k in keywords]
    except Exception as e:
        print(f"Failed to generate trending keywords via LLM: {e}")
        # Use caller-provided fallback keywords if available, otherwise fall back to raw genre IDs
        effective_fallback = fallback_keywords if fallback_keywords else genres
        print(f"Using fallback keywords: {effective_fallback}")
        return [k.lower() for k in effective_fallback]
