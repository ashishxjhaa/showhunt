# ICE / TURN helpers for production WebRTC on Railway (NAT traversal).

from __future__ import annotations

import json
import os
from typing import Any

from loguru import logger
from pipecat.transports.smallwebrtc.connection import IceServer

DEFAULT_STUN = IceServer(urls="stun:stun.l.google.com:19302")


def _as_urls(value: Any) -> str | list[str]:
    if isinstance(value, list):
        return [str(v) for v in value]
    return str(value)


def _parse_entry(entry: Any) -> IceServer | None:
    if isinstance(entry, str):
        url = entry.strip()
        if not url:
            return None
        return IceServer(urls=url)

    if not isinstance(entry, dict):
        return None

    urls = entry.get("urls") or entry.get("url")
    if not urls:
        return None

    username = entry.get("username")
    credential = entry.get("credential") or entry.get("password")
    kwargs: dict[str, Any] = {"urls": _as_urls(urls)}
    if username:
        kwargs["username"] = str(username)
    if credential:
        kwargs["credential"] = str(credential)
    return IceServer(**kwargs)


def load_ice_servers() -> list[IceServer]:
    """Load ICE servers from ICE_SERVERS / PIPECAT_ICE_SERVERS JSON env.

    Expected JSON array, e.g.:
    [
      {"urls": "stun:stun.l.google.com:19302"},
      {
        "urls": ["turn:turn.example.com:3478", "turns:turn.example.com:5349"],
        "username": "user",
        "credential": "pass"
      }
    ]
    """
    raw = (os.getenv("ICE_SERVERS") or os.getenv("PIPECAT_ICE_SERVERS") or "").strip()
    if not raw:
        logger.warning(
            "No ICE_SERVERS configured — production WebRTC behind Railway will likely time out. "
            "Add a TURN server (e.g. Metered.ca or Cloudflare Calls)."
        )
        return [DEFAULT_STUN]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # Comma-separated bare URLs
        servers = [_parse_entry(part.strip()) for part in raw.split(",") if part.strip()]
        out = [s for s in servers if s is not None]
        return out or [DEFAULT_STUN]

    if isinstance(data, dict):
        data = [data]
    if not isinstance(data, list):
        logger.error("ICE_SERVERS must be a JSON array")
        return [DEFAULT_STUN]

    servers = [_parse_entry(item) for item in data]
    out = [s for s in servers if s is not None]
    if not out:
        return [DEFAULT_STUN]

    has_turn = any(
        "turn:" in str(getattr(s, "urls", "")).lower()
        or "turns:" in str(getattr(s, "urls", "")).lower()
        for s in out
    )
    if not has_turn:
        logger.warning(
            "ICE_SERVERS has no TURN entry — remote clients may fail to connect through NAT"
        )
    else:
        logger.info(f"Loaded {len(out)} ICE server(s) including TURN")
    return out
