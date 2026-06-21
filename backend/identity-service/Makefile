build:
	@go build -o ./bin/identity-service ./cmd/main.go

test:
	go test -v ./...

run: build
	@set -a && [ -f .env ] && . ./.env; set +a; ./bin/identity-service

seed-admin:
	@go build -o ./bin/seed ./cmd/seed/main.go
	@set -a && [ -f .env ] && . ./.env; set +a; ./bin/seed $(ARGS)
