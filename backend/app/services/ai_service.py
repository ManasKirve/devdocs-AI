from typing import Optional

from app.ai.llm.base import LLMProvider, LLMResponse
from app.ai.prompts.assistant import build_developer_assistant_system_prompt


class AIService:
    def __init__(self, provider: LLMProvider) -> None:
        self._provider = provider

    async def generate_response(
        self,
        prompt: str,
        *,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        system_prompt = build_developer_assistant_system_prompt()
        return await self._provider.generate_response(
            system_prompt=system_prompt,
            user_prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
