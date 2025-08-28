# Stage 1: build frontend
FROM node:18 AS frontend-builder
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
# build Next.js as standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm run export || true
# Next 14 standalone: .next/standalone exists; but simplest: use 'next export' to get static html


# Stage 2: final image (python + serve via FastAPI)
FROM python:3.11-slim
WORKDIR /app


# deps for audio handling and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
ffmpeg libsndfile1 && rm -rf /var/lib/apt/lists/*


# python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# copy backend
COPY backend/app ./app


# copy exported frontend (if next export used) into static dir
# If you used next export, the exported static files are in frontend/out
COPY --from=frontend-builder /src/frontend/out ./static


ENV STATIC_DIR=/app/static


EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]