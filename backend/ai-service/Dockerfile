FROM python:3.12-slim AS deps
WORKDIR /build
COPY ai-service/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 1000 appuser

WORKDIR /app
COPY --from=deps /install /usr/local
COPY ai-service/config.yaml ./config.yaml
COPY ai-service/src ./src
EXPOSE 8989
USER appuser
CMD ["python", "-m", "main"]
