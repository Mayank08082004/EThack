from openai import OpenAI
import os
import json

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def analyze_sentiment(articles):
    articles = articles[:3]

    combined_text = "\n".join([a[:300] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=300,
        messages=[
            {
                "role": "system",
                "content": (
                    "Analyze the given news articles and track the overarching sentiment shifts over time.\n"
                    "Return ONLY a valid JSON array.\n"
                    "Format:\n"
                    "[\n"
                    "  {\"timeframe\": \"...\", \"score\": <float from -10.0 to 10.0>, \"reason\": \"...\"}\n"
                    "]\n"
                    "Negative values indicate bad news/pessimism, positive indicates good news/optimism. Ensure the shifts are chronological.\n"
                    "Do NOT add any markdown formatting like ```json or explanation, just the raw JSON."
                )
            },
            {
                "role": "user",
                "content": combined_text
            }
        ]
    )

    try:
        text = response.choices[0].message.content.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.endswith('```'):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print("Sentiment parse error:", e)
        return []
