from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    # TODO: implement with Supabase auth
    return {"message": "placeholder — implement with Supabase JWT"}
