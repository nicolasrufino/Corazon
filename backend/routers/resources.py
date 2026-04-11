from fastapi import APIRouter, HTTPException, Query

from database import RESOURCES_TABLE, supabase

router = APIRouter()

RESOURCE_SELECT_COLUMNS = (
    "id,name,category,description,tags,rating,open_now,verified,distance_label,"
    "address,phone,website,languages,image_url,last_updated,city"
)


def _resource_row_to_api(row: dict) -> dict:
    return {
        "id": str(row.get("id", "")),
        "name": row.get("name", ""),
        "category": row.get("category", "community"),
        "description": row.get("description", ""),
        "tags": row.get("tags") or [],
        "rating": float(row.get("rating") or 0),
        "openNow": bool(row.get("open_now", False)),
        "verified": bool(row.get("verified", False)),
        "distanceLabel": row.get("distance_label", ""),
        "address": row.get("address", ""),
        "phone": row.get("phone", ""),
        "website": row.get("website", ""),
        "languages": row.get("languages") or [],
        "imageUrl": row.get("image_url", ""),
        "lastUpdated": str(row.get("last_updated", "")),
    }


@router.get("")
async def list_resources(
    search: str | None = Query(default=None, min_length=1),
    category: str | None = None,
    language: str | None = None,
    city: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    try:
        query = supabase.table(RESOURCES_TABLE).select(RESOURCE_SELECT_COLUMNS)

        if category:
            query = query.eq("category", category)

        if city:
            query = query.eq("city", city)

        if language:
            query = query.contains("languages", [language])

        if search:
            sanitized_search = search.strip()
            query = query.or_(
                f"name.ilike.%{sanitized_search}%,description.ilike.%{sanitized_search}%"
            )

        response = query.order("name").range(offset, offset + limit - 1).execute()
        rows = response.data or []
        return [_resource_row_to_api(row) for row in rows]
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch resources from Supabase: {exc}",
        ) from exc
