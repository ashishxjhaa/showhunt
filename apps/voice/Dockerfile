FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Railway build context = repo root (dockerfilePath apps/voice/Dockerfile).
COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/

ENV PORT=7860
EXPOSE 7860

# Use sh so we don't depend on +x bit; always honor Railway $PORT.
CMD ["sh", "-c", "echo showhunt-voice:port=${PORT:-7860} && exec python -u server.py --host 0.0.0.0 --port ${PORT:-7860}"]
