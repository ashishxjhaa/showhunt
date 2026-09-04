FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Monorepo root as Docker build context (Railway default).
COPY apps/voice/pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir .

COPY apps/voice/ /app/
RUN chmod +x /app/entrypoint.sh

ENV PORT=7860
EXPOSE 7860

CMD ["/app/entrypoint.sh"]
