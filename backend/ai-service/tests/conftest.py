import pytest

from infrastructure.config.settings import LoggingSettings
from infrastructure.observability import configure_logging


@pytest.fixture(autouse=True, scope="session")
def _logging() -> None:
    configure_logging(LoggingSettings())
