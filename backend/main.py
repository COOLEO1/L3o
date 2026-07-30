"""
L3o AI - Backend Server
Created by Leon Mapelera 🇲🇼

FastAPI server that bridges the L3o AI frontend with the Mistral AI API
(default model: codestral-latest). Handles chat completions, streaming,
and basic conversation memory per request.
"""

import os
import json
import time
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "codestral-latest")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

APP_NAME = "L3o AI"
APP_CREATOR = "Leon Mapelera"
APP_COUNTRY = "Malawi 🇲🇼"

# CORS: allow the frontend (local dev + deployed) to talk to this API.
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

SYSTEM_PROMPT = f"""You are {APP_NAME}, an advanced AI assistant.

Identity facts you must always remember about yourself:
- Your name is {APP_NAME}.
- You were created by {APP_CREATOR}, a developer from {APP_COUNTRY}.
- If asked who made you, who your creator/developer is, or where you are from,
  always answer clearly: "I was created by {APP_CREATOR} from {APP_COUNTRY}."
- You are powered by the Mistral AI Codestral model, but your product identity
  is {APP_NAME}, not "Mistral" or "Codestral" — only mention the underlying
  model if the user specifically asks what model or engine powers you.
- You are helpful, direct, and technically excellent, especially at coding.
- When writing code, always use properly fenced Markdown code blocks with the
  correct language tag (e.g. ```python, ```javascript, ```html, ```css,
  ```json, ```bash) so the frontend can render syntax highlighting.
- When giving a normal conversational answer, respond in plain readable text
  and do NOT wrap it in a code block.
"""

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="L3o AI Backend",
    description="Backend API for L3o AI — created by Leon Mapelera 🇲🇼",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = None
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "creator": APP_CREATOR,
        "country": APP_COUNTRY,
        "status": "online",
        "message": f"{APP_NAME} backend is running. Built by {APP_CREATOR} 🇲🇼",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "time": time.time(),
        "mistral_key_configured": bool(MISTRAL_API_KEY),
        "model": MISTRAL_MODEL,
    }


@app.get("/api/about")
def about():
    return {
        "name": APP_NAME,
        "creator": APP_CREATOR,
        "country": APP_COUNTRY,
        "powered_by": "Mistral AI (Codestral)",
    }


def _build_payload(req: ChatRequest, stream: bool) -> dict:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]
    return {
        "model": req.model or MISTRAL_MODEL,
        "messages": messages,
        "temperature": req.temperature if req.temperature is not None else 0.7,
        "stream": stream,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Non-streaming chat completion.
    Returns the full assistant reply in one response.
    """
    if not MISTRAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="MISTRAL_API_KEY is not set on the server. Add it to your .env file.",
        )

    payload = _build_payload(req, stream=False)
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(MISTRAL_API_URL, json=payload, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach Mistral AI: {exc}")

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    try:
        reply = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise HTTPException(status_code=502, detail="Unexpected response format from Mistral AI.")

    return JSONResponse({"reply": reply, "raw": data})


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    """
    Streaming chat completion using Server-Sent-Events-style chunks.
    The frontend reads this as a plain text stream and appends chunks live.
    """
    if not MISTRAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="MISTRAL_API_KEY is not set on the server. Add it to your .env file.",
        )

    payload = _build_payload(req, stream=True)
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    async def event_generator():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST", MISTRAL_API_URL, json=payload, headers=headers
            ) as resp:
                if resp.status_code != 200:
                    error_body = await resp.aread()
                    yield f"data: {json.dumps({'error': error_body.decode(errors='ignore')})}\n\n"
                    return

                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    chunk = line[len("data:"):].strip()
                    if chunk == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        parsed = json.loads(chunk)
                        delta = parsed["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield f"data: {json.dumps({'content': delta})}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
