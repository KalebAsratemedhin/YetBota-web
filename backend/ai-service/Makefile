PYTHON ?= python3
VENV := .venv
BIN := $(VENV)/bin
PYTHONPATH_FOR_RUN := src

.PHONY: install lint format typecheck test test-cov run docker-build clean venv

venv:
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)
	@$(BIN)/pip install --upgrade pip wheel >/dev/null

install: venv
	$(BIN)/pip install -r requirements-dev.txt

lint:
	$(BIN)/ruff check src tests
	$(BIN)/ruff format --check src tests

format:
	$(BIN)/ruff format src tests
	$(BIN)/ruff check --fix src tests

typecheck:
	PYTHONPATH=$(PYTHONPATH_FOR_RUN) $(BIN)/mypy

test:
	PYTHONPATH=$(PYTHONPATH_FOR_RUN) $(BIN)/pytest

test-cov:
	PYTHONPATH=$(PYTHONPATH_FOR_RUN) $(BIN)/pytest --cov=src --cov-report=term-missing

run:
	PYTHONPATH=$(PYTHONPATH_FOR_RUN) $(BIN)/python -m main

docker-build:
	docker build -t yetbota/ai-service:dev -f Dockerfile ..

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache dist build *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
