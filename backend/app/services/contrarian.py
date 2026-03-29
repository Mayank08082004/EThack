from openai import OpenAI
import os
import json

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def extract_contrarian(articles):
    articles = list(articles)[:20]

    combined_text = "\n".join([a[:1500] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=350,
        messages=[
            {
                "role": "system",
                "content": (
                    "Search the given news articles for dissenting opinions, alternative analyses, or counter-narratives that challenge the main overarching story.\n"
                    "Return ONLY a valid JSON array.\n"
                    "Format:\n"
                    "[\n"
                    "  {\"perspective\": \"...\", \"source\": \"Name of person/entity or article snippet\"}\n"
                    "]\n"
                    "CRITICAL: You MUST ONLY use information strictly and explicitly stated in the provided text. Do NOT invent, hallucinate, or assume any perspectives, names, or news outlets. If there are NO genuine contrarian views explicitly in the text, you MUST return an empty array []. Do NOT add any markdown formatting."
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
        print("Contrarian parse error:", e)
        return []
