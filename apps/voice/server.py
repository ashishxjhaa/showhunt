# ShowHunt voice signaling server (Small WebRTC).

import argparse
import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

load_dotenv(override=True)


def _normalize_origin(value: str) -> str:
    return value.strip().rstrip("/")


def load_cors_origins() -> list[str]:
    origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://showhunt.ashishjha.xyz",
    ]
    frontend = os.getenv("FRONTEND_URL", "").strip()
    if frontend:
        origins.append(_normalize_origin(frontend))
    extra = os.getenv("CORS_ORIGINS", "").strip()
    if extra:
        for part in extra.split(","):
            if part.strip():
                origins.append(_normalize_origin(part))
    seen: set[str] = set()
    unique: list[str] = []
    for origin in origins:
        if origin and origin not in seen:
            seen.add(origin)
            unique.append(origin)
    return unique


CORS_ORIGINS = load_cors_origins()

# Lazy-loaded so /health works even if ICE/bot deps fail during import.
_small_webrtc_handler = None


def get_webrtc_handler():
    global _small_webrtc_handler
    if _small_webrtc_handler is not None:
        return _small_webrtc_handler

    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequestHandler
    from ice import load_ice_servers

    _small_webrtc_handler = SmallWebRTCRequestHandler(ice_servers=load_ice_servers())
    return _small_webrtc_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.getenv("PORT") or os.getenv("VOICE_PORT", "7860")
    logger.info(f"ShowHunt voice starting on 0.0.0.0:{port}")
    logger.info(f"Voice CORS allow_origins={CORS_ORIGINS}")
    try:
        get_webrtc_handler()
        logger.info("WebRTC handler ready")
    except Exception:
        logger.exception("WebRTC handler failed to init (health still up)")
    yield
    handler = _small_webrtc_handler
    if handler is not None:
        await handler.close()


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
    return {
        "status": "ok",
        "service": "showhunt-voice",
        "cors": CORS_ORIGINS,
        "webrtc_ready": _small_webrtc_handler is not None,
    }


@app.post("/api/offer")
async def offer(request: Request, background_tasks: BackgroundTasks):
    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequest
    from bot import run_bot

    try:
        handler = get_webrtc_handler()
    except Exception as err:
        logger.exception("WebRTC handler unavailable")
        return JSONResponse(
            {"ok": False, "error": f"Voice WebRTC failed to start: {err}"},
            status_code=503,
        )

    body = await request.json()
    webrtc_request = SmallWebRTCRequest(**body)

    async def webrtc_connection_callback(connection):
        background_tasks.add_task(run_bot, connection)

    answer = await handler.handle_web_request(
        request=webrtc_request,
        webrtc_connection_callback=webrtc_connection_callback,
    )
    return answer


@app.patch("/api/offer")
async def ice_candidate(request: Request):
    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCPatchRequest

    try:
        handler = get_webrtc_handler()
    except Exception as err:
        return JSONResponse(
            {"ok": False, "error": f"Voice WebRTC failed to start: {err}"},
            status_code=503,
        )

    body = await request.json()
    patch = SmallWebRTCPatchRequest(**body)
    await handler.handle_patch_request(patch)
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
