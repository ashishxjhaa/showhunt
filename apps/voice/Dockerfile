FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/

EXPOSE 7860
CMD ["python", "server.py", "--host", "0.0.0.0", "--port", "7860"]
