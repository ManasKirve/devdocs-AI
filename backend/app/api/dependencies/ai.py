from app.ai.llm.grok import GrokProvider
from app.core.config import get_settings
from app.services.ai_service import AIService


def get_ai_service() -> AIService:
    settings = get_settings()
    provider = GrokProvider(
        api_key=settings.xai_api_key,
        model=settings.xai_model,
        base_url=settings.xai_base_url,
        timeout_seconds=settings.xai_timeout_seconds,
    )
    return AIService(provider=provider)
