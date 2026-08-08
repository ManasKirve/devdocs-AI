from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.search import get_search_service
from app.schemas.search import SearchRequest, SearchResponse, SearchResultItem
from app.services.search_service import SearchService

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search(
    payload: SearchRequest,
    service: Annotated[SearchService, Depends(get_search_service)],
) -> SearchResponse:
    hits = await service.search(
        payload.query,
        repository=payload.repository,
        top_k=payload.top_k,
    )
    return SearchResponse(
        query=payload.query,
        results=[
            SearchResultItem(**hit.model_dump(exclude={"repository"}))
            for hit in hits
        ],
    )
