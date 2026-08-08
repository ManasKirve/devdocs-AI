from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.repositories import get_repository_service
from app.schemas.repositories import IngestRequest, IngestResponse
from app.services.repository_service import RepositoryIngestionService

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.post("/ingest", response_model=IngestResponse)
async def ingest_repository(
    payload: IngestRequest,
    service: Annotated[
        RepositoryIngestionService, Depends(get_repository_service)
    ],
) -> IngestResponse:
    return await service.ingest(payload.repository_url)
