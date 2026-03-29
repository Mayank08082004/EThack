from openai import OpenAI
import os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def generate_summary(articles):
    articles = list(articles)[:20]

    combined_text = "\n\n".join([a[:1500] for a in articles])

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