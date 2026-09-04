FROM python:3.12-slim

WORKDIR /app

# 1) Tiny server deps — image must listen on $PORT immediately.
RUN pip install --no-cache-dir \
    "fastapi>=0.115" \
    "uvicorn[standard]>=0.32" \
    "python-dotenv>=1.0" \
    "loguru>=0.7"

COPY apps/voice/server.py apps/voice/ice.py apps/voice/bot.py apps/voice/tools.py apps/voice/pyproject.toml /app/

# 2) Heavy voice stack (Pipecat). Health works even if this is still installing in older images.
RUN pip install --no-cache-dir .

ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "echo showhunt-voice:listen=0.0.0.0:${PORT:-7860} && exec python -u -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-7860}"]
