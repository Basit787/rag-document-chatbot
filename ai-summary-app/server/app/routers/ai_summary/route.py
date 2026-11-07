from fastapi import APIRouter, BackgroundTasks, Depends, status
from .dependencies import get_ai_service
from .schema import SummaryRequest
from .service import AIService

summary_router = APIRouter()


@summary_router.post(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
)
def summarize_document(
    request: SummaryRequest,
    background_tasks: BackgroundTasks,
    service: AIService = Depends(get_ai_service),
):
    background_tasks.add_task(
        service.process_document,
        request.document_id,
    )

    return {
        "message": "Document summarization started.",
        "document_id": request.document_id,
    }
