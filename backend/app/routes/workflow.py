from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Dict
import re
from werkzeug.exceptions import HTTPException
router = APIRouter()
import os
from dotenv import load_dotenv
from google import genai


load_dotenv()                # loads .env into environment
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("Please set GOOGLE_API_KEY in your environment or .env")

client = genai.Client()
#genai.configure(api_key=API_KEY)


#odel = genai.GenerativeModel('gemini-pro')

class NodeData(BaseModel):
    id: str
    type: str
    config: Dict
    connections: List[str]

class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    
class WorkflowPayload(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]


def _simple_retrieve(kb_text: str, query: str, top_k: int = 3) -> str:
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', kb_text.strip())
    if not sentences:
        return ""
    # If no query, just return first K
    if not query:
        return " ".join(sentences[:top_k])

    # Score sentences by overlap with query words
    qwords = {w for w in re.findall(r'\w+', query.lower()) if len(w) > 2}
    scored = []
    for s in sentences:
        sw = set(re.findall(r'\w+', s.lower()))
        score = len(qwords & sw)
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [s for score, s in scored if score > 0][:top_k]
    if not selected:
        selected = sentences[:top_k]
    return " ".join(selected)



@router.post("/api/save-workflow")
async def save_workflow(nodes: List[NodeData]):
    # For now just print and return
    print("Received workflow:", nodes)
    return {"status": "success", "received_nodes": len(nodes)}

@router.post("/api/run-workflow")
async def run_workflow(payload: WorkflowPayload):
    # print("Running Workflow...")
    # print("Nodes:", payload.nodes)
    # print("Edges:", payload.edges)

    # return {"status": "running", "nodes": len(payload.nodes), "edges": len(payload.edges)}
        print("Running Workflow...")

        print("nodes : ", payload.nodes)
        node_map = {node.id: node for node in payload.nodes}
        results = {}

        # Build reverse connections (incoming edges)
        incoming_map = {node.id: [] for node in payload.nodes}
        for edge in payload.edges:
            incoming_map[edge.target].append(edge.source)


        # # Replace node.connections with incoming edges
        # for node in payload.nodes:
        #     node.connections = incoming_map[node.id]


        def process_node(node_id):
            node = node_map[node_id]
            node_type = node.type
            config = node.config
            connections = incoming_map[node_id]

            if node_type == "UserQuery":
                results[node_id] = config.get("placeholder", "User input")
            

            elif node_type == "KnowledgeBase":


                kb_text = str(config.get("kbText", "")).strip()
                if not kb_text:
                    raise HTTPException(status_code=400, detail=f"KnowledgeBase {node_id} has no text")
                # get upstream text (e.g., user query) from incoming nodes
                inputs = [results.get(conn_id, "") for conn_id in connections]
                user_query = inputs[0] if inputs else ""

                kb_text = str(config.get("kbText", "")).strip()
                top_k = int(config.get("topK", 3))

                if not kb_text:
                    results[node_id] = "(KB empty)"
                else:
                    ctx = _simple_retrieve(kb_text, user_query, top_k)
                    results[node_id] = f"[Context] {ctx}"

            
            elif node_type == "LLMEngine":


                for n in payload.nodes:

                    #query_input
                    if n.type == "UserQuery":
                        query_input = n.config.get("placeholder", "")
                    
                    #kb_input
                    if n.type == "KnowledgeBase":
                        kb_input = n.config.get("kbText", "")

                
                #kb_input

                inputs = [results.get(conn_id, "") for conn_id in connections]
                prompt = config.get("customPrompt", "Respond: {input}")
                input_text = " ".join(inputs)


                final_prompt = prompt.replace("{input}", query_input)
                # For now just return the prompt instead of calling OpenAI

                final_prompt = final_prompt.replace("{context}", kb_input)
                
                print(" final prompt : ",final_prompt)
                results[node_id] = f"LLM response to: {final_prompt}"



                kb_contexts = []
                for uid in connections:
                    up = node_map[uid]
                    if up.type == "KnowledgeBase":
                        kb_contexts.append(results.get(uid, ""))

                context_text = "\n\n".join([c for c in kb_contexts if c])

                # --- Call Gemini via the Gen AI SDK ---
                try:
                    # model choice: example using a flash model from docs; change as needed
                    #model_name = "gemini-2.0-flash-001"   # example from docs; pick available one for your access
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=final_prompt
                        # config=types.GenerateContentConfig(
                        #     thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
                        # ),
                    )
                    # the SDK returns an object with .text property
                    llm_text = response.text if hasattr(response, "text") else str(response)
                except Exception as e:
                    # catch SDK/API errors and surface them gracefully
                    llm_text = f"[LLM ERROR] {str(e)}"


                results[node_id] = llm_text

            elif node_type == "Output":
                inputs = [results.get(conn_id, "") for conn_id in connections]
                results[node_id] = "Final Output: " + " ".join(inputs)



            else:
                results[node_id] = f"Unknown node type: {node_type}"

        # Process all nodes
        for node in payload.nodes:
            process_node(node.id)

        # Return final result from the Output node(s)
        output_nodes = [n for n in payload.nodes if n.type == "Output"]
        output_results = {n.id: results[n.id] for n in output_nodes}

        

        return {
            "status": "success",
            "output": output_results,
            "all_results": results
        }