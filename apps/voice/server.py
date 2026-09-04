# ShowHunt voice signaling server (Small WebRTC).
# Keep startup light: never import Pipecat before the server is listening.

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
    out: list[str] = []
    for origin in origins:
        if origin and origin not in seen:
            seen.add(origin)
            out.append(origin)
    return out


CORS_ORIGINS = load_cors_origins()
_webrtc_handler = None


def get_webrtc_handler():
    """Import Pipecat only on first voice call — never during boot."""
    global _webrtc_handler
    if _webrtc_handler is not None:
        return _webrtc_handler
    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequestHandler
    from ice import load_ice_servers

    _webrtc_handler = SmallWebRTCRequestHandler(ice_servers=load_ice_servers())
    return _webrtc_handler


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Yield immediately so Railway can health-check / bind PORT.
    logger.info(f"Voice CORS allow_origins={CORS_ORIGINS}")
    yield
    if _webrtc_handler is not None:
        await _webrtc_handler.close()


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
        "webrtc_ready": _webrtc_handler is not None,
    }


@app.post("/api/offer")
async def offer(request: Request, background_tasks: BackgroundTasks):
    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequest
    from bot import run_bot

    try:
        handler = get_webrtc_handler()
    except Exception as err:
        logger.exception("WebRTC init failed")
        return JSONResponse({"ok": False, "error": str(err)}, status_code=503)

    body = await request.json()
    webrtc_request = SmallWebRTCRequest(**body)

    async def on_connection(connection):
        background_tasks.add_task(run_bot, connection)

    return await handler.handle_web_request(
        request=webrtc_request,
        webrtc_connection_callback=on_connection,
    )


@app.patch("/api/offer")
async def ice_candidate(request: Request):
    from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCPatchRequest

    try:
        handler = get_webrtc_handler()
    except Exception as err:
        return JSONResponse({"ok": False, "error": str(err)}, status_code=503)

    body = await request.json()
    await handler.handle_patch_request(SmallWebRTCPatchRequest(**body))
    return {"status": "success"}


def main() -> None:
    parser = argparse.ArgumentParser(description="ShowHunt voice agent")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=None)
    parser.add_argument("--verbose", "-v", action="count")
    args = parser.parse_args()

    port = args.port or int(os.getenv("PORT") or os.getenv("VOICE_PORT") or "7860")

    logger.remove()
    logger.add(sys.stderr, level="TRACE" if args.verbose else "INFO")
    logger.info(f"Starting ShowHunt voice on {args.host}:{port}")

    uvicorn.run(
        app,
        host=args.host,
        port=port,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )


if __name__ == "__main__":
    main()
