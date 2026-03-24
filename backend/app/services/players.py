from openai import OpenAI
import os
import json

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def extract_players(articles):
    articles = articles[:3]

    combined_text = "\n".join([a[:300] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=300,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract the key players (individuals, companies, or institutions) driving this news story.\n"
                    "Return ONLY a valid JSON array.\n"
                    "Format:\n"
                    "[\n"
                    "  {\"name\": \"...\", \"type\": \"Person/Company/Institution\", \"role\": \"Brief description of their stance or involvement\"}\n"
                    "]\n"
                    "Do NOT add any explanation or markdown formatting."
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
        print("Players parse error:", e)
        return []
