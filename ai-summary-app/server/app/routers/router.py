from fastapi import APIRouter
from routers.document_upload.route import document_router
from routers.ai_summary.route import summary_router
from routers.auth.route import auth_router
from routers.users.route import user_router
from core.deps import AuthRequired


router_api = APIRouter()

router_api.include_router(
    document_router,
    prefix="/documents",
    tags=["Documents"],
    dependencies=[AuthRequired],
)
router_api.include_router(
    summary_router,
    prefix="/summarize",
    tags=["AI Summary"],
    dependencies=[AuthRequired],
)
router_api.include_router(
    user_router,
    prefix="/users",
    tags=["Users"],
    dependencies=[AuthRequired],
)

router_api.include_router(auth_router, prefix="/auth", tags=["Authentication"])


@router_api.get("/")
def main():
    return {"message": "Hello from server"}


@router_api.get("/health")
def health():
    return {"message": "Server is running healthy"}
