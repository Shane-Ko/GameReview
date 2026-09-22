from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
import httpx
import json


OLLAMA_URL = "http://localhost:11434"  # PuTTY 터널 (L5512 → 서버 localhost:11434)
MODEL_NAME = "qwen2.5:7b"
ALLOWED_ORIGINS = ["http://localhost:5173"]

with open("../db.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

games_list = [
    {
        "title": g["title"],
        "developer": g["developer"],
        "releaseYear": g["releaseYear"],
        "description": g["description"],
        "rating": g["rating"],
        "tags": g["tags"],
    }
    for g in raw["games"]
]

SYSTEM_PROMPT = (
    "당신은 게임 리뷰 사이트의 AI 도우미입니다. "
    "게임 추천, 리뷰 작성 팁, 게임 관련 질문에 친절하게 답변해 주세요. "
    "한국어로 답변해 주세요.\n\n"
    "아래는 현재 사이트에 등록된 게임 목록입니다:\n"
    f"{json.dumps(games_list, ensure_ascii=False, indent=2)}"
)

#----- 앱 설정 ------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,         # 브라우저는 보안상 다른 주소끼리 통신을 차단함 (= CORS)
                            # 그래서 5173 에서 오는 요청을 허용하는 코드
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic 모델 ──────────────────────────────────
class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


# ── 엔드포인트 ─────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(req: ChatRequest):

    messages = (
        [{"role": "system", "content": SYSTEM_PROMPT}]
        + [m.model_dump() for m in req.history]
        + [{"role": "user", "content": req.message}]
    )

    async def stream():
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/api/chat",
                    json={"model": MODEL_NAME, "messages": messages, "stream": True},
                ) as res:
                    async for line in res.aiter_lines():
                        if not line:
                            continue
                        data = json.loads(line)
                        token = data.get("message", {}).get("content", "")
                        if token:
                            yield f"data: {json.dumps({'token': token})}\n\n"
                        if data.get("done"):
                            yield "data: [DONE]\n\n"
                            return
        except Exception as e:
            print(f"[ERROR] {e}")  # ← 이거 추가
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")