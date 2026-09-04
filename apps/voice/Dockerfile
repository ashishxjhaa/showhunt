FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Works when Railway build context is the monorepo root.
COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/

ENV PORT=7860
EXPOSE 7860

# Railway injects PORT — must listen on that port or you get 502.
CMD ["sh", "-c", "exec python server.py --host 0.0.0.0 --port ${PORT:-7860}"]
