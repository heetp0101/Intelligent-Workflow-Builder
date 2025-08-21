# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Dict, AnyStr
from dotenv import load_dotenv
import os
import google.generativeai as genai
from routes import workflow


# 👇 CORS setup
origins = [
    "http://localhost:3000",  # frontend origin
]

app = FastAPI()


# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# router = APIRouter()

# class NodeData(BaseModel):
#     id: str
#     type: str
#     config: Dict
#     connections: List[str]


@app.get("/")
def read_root():
    return {"message": "Backend is running"}


# @app.post("/api/save_workflow")
# async def save_workflow(nodes: List[NodeData]):
#     # For now just print and return
#     print("Received workflow:", nodes)
#     return {"status": "success", "received_nodes": len(nodes)}

# @app.post("/api/save-workflow")
# async def save_workflow(nodes: List[NodeData]):
    
#     print("Received workflow:", nodes)
#     return {"status": "received", "count": len(nodes), "workflow": nodes}

app.include_router(workflow.router)