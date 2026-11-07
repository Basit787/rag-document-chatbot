from openai import OpenAI
from core.config import Config


class LLMHelper:
    def __init__(self):
        self.client = OpenAI(
            api_key=Config.OPENROUTER_API_KEY,
            base_url=Config.OPENROUTER_BASE_URL,
        )

        self.model = Config.OPENROUTER_MODEL

    def generate_summary(
        self,
        text: str,
    ) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert document summarizer. "
                        "Create a concise and accurate summary. "
                        "Highlight the key ideas, important facts, and conclusions."
                    ),
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
            temperature=0.3,
        )

        return response.choices[0].message.content


llm_helper = LLMHelper()
