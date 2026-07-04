from fastapi import APIRouter
from models.schemas import ApiStatus
from services.budget import get_status

router = APIRouter()


@router.get("/status", response_model=ApiStatus)
async def api_status():
    return await get_status()
