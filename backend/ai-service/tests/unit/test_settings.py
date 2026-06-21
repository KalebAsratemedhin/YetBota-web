import textwrap
from pathlib import Path

import pytest

from infrastructure.config.loader import load_config
from infrastructure.config.settings import Settings


@pytest.fixture
def config_file(tmp_path: Path) -> Path:
    content = textwrap.dedent(
        """
        app:
          name: test-ai
          version: 0.0.1
          debug: false
        cors:
          hosts:
            - http://localhost:3000
        database:
          host: localhost
          port: "5432"
          user: postgres
          password: secret
          db: yetbota
        neo4j:
          uri: bolt://localhost:7687
          username: neo4j
          password: neo4jpass
        rabbitmq:
          url: amqp://guest:guest@localhost:5672/
        weaviate:
          url: http://localhost:8081
          api_key: test-key
        gemini:
          api_key: gemini-key
        internal:
          service_token: test-token
        """
    ).strip()
    path = tmp_path / "config.yaml"
    path.write_text(content)
    return path


def test_settings_load_from_yaml(config_file: Path) -> None:
    settings = Settings.model_validate(load_config(config_file))
    assert settings.app.name == "test-ai"
    assert settings.gemini.llm_model == "gemini-2.5-flash"
    assert settings.rag.top_k == 8
    assert settings.postgres.dsn.startswith("postgres://postgres:secret@localhost:5432/yetbota")


def test_env_substitution(config_file: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    config_file.write_text(
        textwrap.dedent(
            """
            app:
              name: test-ai
              version: 0.0.1
              debug: ${debug}
            cors:
              hosts:
                - ${corsHosts}
            database:
              host: ${postgresHost}
              port: ${postgresPort}
              user: ${postgresUser}
              password: ${postgresPassword}
              db: ${postgresDB}
            neo4j:
              uri: ${neo4jURI}
              username: ${neo4jUsername}
              password: ${neo4jPassword}
            rabbitmq:
              url: ${rabbitmqUrl}
            weaviate:
              url: ${weaviateUrl}
              api_key: ${weaviateApiKey}
            gemini:
              api_key: ${geminiApiKey}
            internal:
              service_token: ${internalServiceToken}
            """
        ).strip()
    )
    monkeypatch.setenv("debug", "true")
    monkeypatch.setenv("corsHosts", "http://localhost:3000")
    monkeypatch.setenv("postgresHost", "db.example.com")
    monkeypatch.setenv("postgresPort", "5432")
    monkeypatch.setenv("postgresUser", "app")
    monkeypatch.setenv("postgresPassword", "pw")
    monkeypatch.setenv("postgresDB", "yetbota")
    monkeypatch.setenv("neo4jURI", "bolt://neo4j:7687")
    monkeypatch.setenv("neo4jUsername", "neo4j")
    monkeypatch.setenv("neo4jPassword", "neo4jpass")
    monkeypatch.setenv("rabbitmqUrl", "amqp://rabbit:5672/")
    monkeypatch.setenv("weaviateUrl", "https://weaviate.example.com")
    monkeypatch.setenv("weaviateApiKey", "wv-key")
    monkeypatch.setenv("geminiApiKey", "gm-key")
    monkeypatch.setenv("internalServiceToken", "internal-token")

    settings = Settings.model_validate(load_config(config_file))
    assert settings.app.debug is True
    assert settings.postgres.host == "db.example.com"
    assert settings.rabbitmq.url == "amqp://rabbit:5672/"
    assert settings.weaviate.url == "https://weaviate.example.com"
    assert settings.gemini.api_key == "gm-key"
