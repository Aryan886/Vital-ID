import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key="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")


def ask_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
