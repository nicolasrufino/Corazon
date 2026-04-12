# api.py
#
# PURPOSE: FastAPI wrapper around algorithms.py, exposed on port 8001.
# This file is the bridge between the TypeScript backend and algorithms.py.
# No algorithm logic lives here — every endpoint delegates to algorithms.py.

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any

from algorithms import (
    build_simple_archetype,
    build_complex_archetype,
    update_complex_archetype,
    should_update,
    calculate_time_saved,
    get_top_resources,
    estimate_impact,
)

app = FastAPI(title="Corazon AI Algorithms Service", version="1.0.0")


# ── REQUEST MODELS ────────────────────────────────────────────────────────────

class SimpleArchetypeRequest(BaseModel):
    immigration_status: str
    preferred_language: str
    occupation: str


class ComplexArchetypeRequest(BaseModel):
    simple_archetype: dict[str, Any]
    interactions_log: list[str]


class UpdateComplexArchetypeRequest(BaseModel):
    complex_archetype: dict[str, Any]
    new_interactions: list[str]


class ShouldUpdateRequest(BaseModel):
    complex_archetype: dict[str, Any]


class CalculateTimeSavedRequest(BaseModel):
    simple_archetype: dict[str, Any]
    interactions_log: list[str]


class GetTopResourcesRequest(BaseModel):
    complex_archetype: dict[str, Any]
    orgs: list[dict[str, Any]]
    n: int = 5


class EstimateImpactRequest(BaseModel):
    simple_archetype: dict[str, Any]


# ── ENDPOINTS ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/build-simple-archetype")
def api_build_simple_archetype(body: SimpleArchetypeRequest):
    try:
        result = build_simple_archetype(
            immigration_status=body.immigration_status,
            preferred_language=body.preferred_language,
            occupation=body.occupation,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/build-complex-archetype")
def api_build_complex_archetype(body: ComplexArchetypeRequest):
    try:
        result = build_complex_archetype(
            simple_archetype=body.simple_archetype,
            interactions_log=body.interactions_log,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/update-complex-archetype")
def api_update_complex_archetype(body: UpdateComplexArchetypeRequest):
    try:
        result = update_complex_archetype(
            complex_archetype=body.complex_archetype,
            new_interactions=body.new_interactions,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/should-update")
def api_should_update(body: ShouldUpdateRequest):
    try:
        result = should_update(body.complex_archetype)
        return {"should_update": result}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/calculate-time-saved")
def api_calculate_time_saved(body: CalculateTimeSavedRequest):
    try:
        result = calculate_time_saved(
            simple_archetype=body.simple_archetype,
            interactions_log=body.interactions_log,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/get-top-resources")
def api_get_top_resources(body: GetTopResourcesRequest):
    try:
        result = get_top_resources(
            complex_archetype=body.complex_archetype,
            all_orgs=body.orgs,
            n=body.n,
        )
        return {"orgs": result}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/estimate-impact")
def api_estimate_impact(body: EstimateImpactRequest):
    try:
        result = estimate_impact(body.simple_archetype)
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
