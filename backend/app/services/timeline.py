from openai import OpenAI
import os
import json

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def extract_timeline(articles):
    articles = list(articles)[:20]

    combined_text = "\n".join([a[:1500] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=300,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract key business events from the news.\n"
                    "Return ONLY valid JSON array.\n"
                    "Format:\n"
                    "[\n"
                    "  {\"date\": \"...\", \"event\": \"...\", \"impact\": \"Positive/Negative/Neutral\", \"stage\": \"...\"}\n"
                    "]\n"
                    "Do NOT add any explanation."
                )
            },
            {
                "role": "user",
                "content": combined_text
            }
        ]
    )

    try:
        return json.loads(response.choices[0].message.content)
    except:
        return []