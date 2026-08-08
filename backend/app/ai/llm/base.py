from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class LLMResponse:
    content: str
    model: str = ""
    provider: str = ""


class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        raise NotImplementedError
