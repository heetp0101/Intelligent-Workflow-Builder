# backend/app/routers/kb_routes.py
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..services.kb_service import ingest_text, ingest_pdf, query_kb

router = APIRouter(prefix="/api/kb", tags=["knowledge-base"])

@router.post("/upload")
async def upload_kb_file(
    node_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Save temp file
    ext = (file.filename or "").lower()
    tmp_dir = "./tmp_uploads"
    os.makedirs(tmp_dir, exist_ok=True)
    tmp_path = os.path.join(tmp_dir, f"{uuid.uuid4()}_{ext}")

    with open(tmp_path, "wb") as f:
        f.write(await file.read())

    # Decide how to ingest
    try:
        if ext.endswith(".pdf"):
            count = ingest_pdf(node_id, tmp_path)
        else:
            # treat as plain text
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as rf:
                text = rf.read()
            count = ingest_text(node_id, text, source=os.path.basename(ext))
    finally:
        # cleanup
        try:
            os.remove(tmp_path)
        except:
            pass

    if count == 0:
        raise HTTPException(status_code=400, detail="No content ingested")

    return {"status": "ok", "ingested_chunks": count, "doc_id": node_id}

class KBQueryPayload(BaseNotFoundError := object): pass  # just placeholder to avoid name clash
from pydantic import BaseModel

class KBQueryBody(BaseModel):
    question: str
    top_k: Optional[int] = 3

@router.post("/query")
async def kb_query(body: KBQueryBody):
    docs, metas, ids = query_kb(body.question, top_k=body.top_k or 3)
    return {"status": "ok", "chunks": docs, "metadatas": metas, "ids": ids}
