from app.ai.llm.groq import GroqProvider
from app.core.config import get_settings
from app.services.ai_service import AIService


def get_ai_service() -> AIService:
    settings = get_settings()
    provider = GroqProvider(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        base_url=settings.groq_base_url,
        timeout_seconds=settings.groq_timeout_seconds,
    )
    return AIService(provider=provider)