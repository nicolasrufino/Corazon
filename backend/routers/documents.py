from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # TODO: parse and store document, trigger AI analysis
    return {"filename": file.filename, "status": "received"}
