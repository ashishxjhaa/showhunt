FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Railway build context = directory of this Dockerfile (apps/voice).
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY . .
RUN chmod +x entrypoint.sh

ENV PORT=7860
EXPOSE 7860

CMD ["./entrypoint.sh"]
