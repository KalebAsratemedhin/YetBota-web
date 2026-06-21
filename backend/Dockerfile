# syntax=docker/dockerfile:1

FROM golang:1.26-alpine AS identity-builder
WORKDIR /repo
COPY identity-service/go.mod identity-service/go.sum ./identity-service/
RUN cd identity-service && go mod download
COPY identity-service/ ./identity-service/
RUN cd identity-service && CGO_ENABLED=0 GOOS=linux go build -o /out/identity-service ./cmd/main.go

FROM golang:1.26-alpine AS content-builder
WORKDIR /repo
COPY content-service/go.mod content-service/go.sum ./content-service/
RUN cd content-service && go mod download
COPY content-service/ ./content-service/
RUN cd content-service && CGO_ENABLED=0 GOOS=linux go build -o /out/content-service ./cmd/main.go

FROM golang:1.26-alpine AS gateway-builder
WORKDIR /repo
COPY gateway/go.mod ./gateway/
RUN cd gateway && go mod download
COPY gateway/ ./gateway/
RUN cd gateway && CGO_ENABLED=0 GOOS=linux go build -o /out/gateway .

FROM python:3.12-slim AS ai-deps
WORKDIR /build
COPY ai-service/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates tzdata \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 1000 appuser

WORKDIR /app

COPY --from=identity-builder /out/identity-service ./identity/
COPY identity-service/config.yaml ./identity/
COPY identity-service/migrations ./identity/migrations

COPY --from=content-builder /out/content-service ./content/
COPY content-service/config.yaml ./content/
COPY content-service/migrations ./content/migrations

COPY --from=gateway-builder /out/gateway ./gateway/

COPY --from=ai-deps /install /usr/local
COPY ai-service/config.yaml ./ai/
COPY ai-service/src ./ai/src
ENV PYTHONUNBUFFERED=1

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8080
USER appuser
CMD ["/app/start.sh"]
