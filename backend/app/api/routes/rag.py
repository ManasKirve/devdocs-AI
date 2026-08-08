from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.rag import get_rag_service
from app.schemas.rag import RAGRequest, RAGResponse, RAGSource
from app.services.rag_service import RAGService

router = APIRouter(tags=["rag"])


@router.post("/rag", response_model=RAGResponse)
async def generate_rag_response(
    payload: RAGRequest,
    service: Annotated[RAGService, Depends(get_rag_service)],
) -> RAGResponse:
    result = await service.generate(
        payload.query,
        repository=payload.repository,
        top_k=payload.top_k,
    )
    return RAGResponse(
        query=payload.query,
        answer=result.answer,
        format=result.format,
        sources=[
            RAGSource(**hit.model_dump(exclude={"repository", "content"}))
            for hit in result.sources
        ],
    )
