from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_resources():
    # TODO: fetch from MongoDB
    return []
