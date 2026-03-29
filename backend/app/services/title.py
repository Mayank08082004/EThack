from openai import OpenAI
import os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def generate_title(articles):
    articles = list(articles)[:20]

    combined_text = "\n".join([a[:800] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=50,
        messages=[
            {
                "role": "system",
                "content": (
                    "Generate a concise, professional news headline.\n"
                    "Max 12 words.\n"
                    "No explanation.\n"
                    "Make it impactful.\n"
                ),
            },
            {
                "role": "user",
                "content": combined_text,
            },
        ],
    )

    return response.choices[0].message.content.strip()