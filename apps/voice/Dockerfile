FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/

ENV PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "python server.py --host 0.0.0.0 --port ${PORT:-7860}"]
