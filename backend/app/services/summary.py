from openai import OpenAI
import os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def generate_summary(articles):
    # 🔥 Limit content (IMPORTANT)
    articles = articles[:3]  # only first 3 articles

    combined_text = "\n\n".join([a[:500] for a in articles])  # limit each

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=200,  # 🔥 LIMIT OUTPUT
        messages=[
            {
                "role": "system",
                "content": "Summarize the business news in 2-3 concise lines."
            },
            {
                "role": "user",
                "content": combined_text
            }
        ]
    )

    return response.choices[0].message.content