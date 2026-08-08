from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.ai import get_ai_service
from app.schemas.ai import GenerateRequest, GenerateResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate", response_model=GenerateResponse)
async def generate(
    payload: GenerateRequest,
    service: Annotated[AIService, Depends(get_ai_service)],
) -> GenerateResponse:
    result = await service.generate_response(
        payload.prompt,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
    )
    return GenerateResponse(response=result.content)
