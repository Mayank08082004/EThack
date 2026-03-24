from openai import OpenAI
import os
import json

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

def extract_predictions(articles):
    articles = articles[:3]

    combined_text = "\n".join([a[:300] for a in articles])

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        max_tokens=350,
        messages=[
            {
                "role": "system",
                "content": (
                    "Based on the provided news articles, project 1 to 3 logical next steps, upcoming catalysts, or 'what to watch next' scenarios for this storyline.\n"
                    "Return ONLY a valid JSON array.\n"
                    "Format:\n"
                    "[\n"
                    "  {\"event\": \"...\", \"probability\": \"High/Medium/Low\", \"details\": \"Brief explanation of why this is the next logical catalyst\"}\n"
                    "]\n"
                    "Extrapolate logically based on the trajectory of the events. Do NOT add any markdown formatting or explanations."
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
        print("Predictions parse error:", e)
        return []
