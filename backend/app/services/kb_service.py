# backend/app/services/kb_service.py
import os
from typing import List, Tuple
import chromadb
from chromadb.config import Settings
import fitz  # PyMuPDF
import google.generativeai as genai

# --- Setup ---
CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_data")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY not set")

genai.configure(api_key=GOOGLE_API_KEY)

# Persistent Chroma client
client = chromadb.PersistentClient(path=CHROMA_DB_DIR, settings=Settings(anonymized_telemetry=False))
COLLECTION_NAME = "kb_collection"
collection = client.get_or_create_collection(name=COLLECTION_NAME)

# --- Helpers ---

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    parts = []
    for page in doc:
        parts.append(page.get_text())
    doc.close()
    return "\n".join(parts)

def chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    text = text.replace("\r", " ").replace("\n", " ")
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(n, start + max_chars)
        chunks.append(text[start:end])
        if end == n:
            break
        start = end - overlap
        if start < 0:
            start = 0
    return [c.strip() for c in chunks if c.strip()]

def embed_texts(texts: List[str]) -> List[List[float]]:
    # Gemini embeddings model
    # "text-embedding-004" is the recommended universal embedding model
    vectors = []
    for t in texts:
        resp = genai.embed_content(model="text-embedding-004", content=t)
        vectors.append(resp["embedding"])
    return vectors

# --- Public API ---

def ingest_text(doc_id: str, raw_text: str, source: str = "upload") -> int:
    chunks = chunk_text(raw_text)
    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"doc_id": doc_id, "source": source, "chunk_index": i} for i in range(len(chunks))]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)
    return len(chunks)

def ingest_pdf(doc_id: str, file_path: str) -> int:
    text = extract_text_from_pdf(file_path)
    return ingest_text(doc_id, text, source=os.path.basename(file_path))

def query_kb(question: str, top_k: int = 3) -> Tuple[List[str], List[dict], List[str]]:
    if not question.strip():
        return [], [], []
    q_emb = embed_texts([question])[0]
    res = collection.query(query_embeddings=[q_emb], n_results=max(1, top_k))
    # chroma returns lists-of-lists
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    ids = (res.get("ids") or [[]])[0]
    return docs, metas, ids
