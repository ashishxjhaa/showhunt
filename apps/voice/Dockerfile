FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Build context = monorepo root (Railway dockerfilePath = apps/voice/Dockerfile).
COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/

# Match Railway public port: set Variables PORT=7860 (and Target Port 7860) if 502 persists.
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "echo showhunt-voice:listen=0.0.0.0:${PORT} && exec python -u -m uvicorn server:app --host 0.0.0.0 --port ${PORT}"]
