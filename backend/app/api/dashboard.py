from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.schemas.dashboard_schema import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/",
    response_model=DashboardResponse,
)
async def dashboard(
    current_user=Depends(get_current_user),
):
    return await DashboardService.get_dashboard(
        current_user
    )