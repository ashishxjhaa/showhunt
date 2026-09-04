# ShowHunt voice signaling server (Small WebRTC).

import argparse
import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pipecat.transports.smallwebrtc.request_handler import (
    SmallWebRTCPatchRequest,
    SmallWebRTCRequest,
    SmallWebRTCRequestHandler,
)

from bot import run_bot
from ice import load_ice_servers

load_dotenv(override=True)


def _normalize_origin(value: str) -> str:
    return value.strip().rstrip("/")


def load_cors_origins() -> list[str]:
    """Origins allowed to call /api/offer from the browser."""
    origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    frontend = os.getenv("FRONTEND_URL", "").strip()
    if frontend:
        origins.append(_normalize_origin(frontend))

    # Comma-separated extras, e.g. https://showhunt.ashishjha.xyz,https://www...
    extra = os.getenv("CORS_ORIGINS", "").strip()
    if extra:
        for part in extra.split(","):
            if part.strip():
                origins.append(_normalize_origin(part))

    # De-dupe, keep order
    seen: set[str] = set()
    unique: list[str] = []
    for origin in origins:
        if origin and origin not in seen:
            seen.add(origin)
            unique.append(origin)
    return unique


CORS_ORIGINS = load_cors_origins()
small_webrtc_handler = SmallWebRTCRequestHandler(ice_servers=load_ice_servers())


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Voice CORS allow_origins={CORS_ORIGINS}")
    yield
    await small_webrtc_handler.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "service": "showhunt-voice", "cors": CORS_ORIGINS}


@app.post("/api/offer")
async def offer(request: SmallWebRTCRequest, background_tasks: BackgroundTasks):
    async def webrtc_connection_callback(connection):
        background_tasks.add_task(run_bot, connection)

    answer = await small_webrtc_handler.handle_web_request(
        request=request,
        webrtc_connection_callback=webrtc_connection_callback,
    )
    return answer


@app.patch("/api/offer")
async def ice_candidate(request: SmallWebRTCPatchRequest):
    await small_webrtc_handler.handle_patch_request(request)
    return {"status": "success"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ShowHunt voice agent")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT") or os.getenv("VOICE_PORT", "7860")),
    )
    parser.add_argument("--verbose", "-v", action="count")
    args = parser.parse_args()

    logger.remove(0)
    logger.add(sys.stderr, level="TRACE" if args.verbose else "INFO")

    uvicorn.run(app, host=args.host, port=args.port)
