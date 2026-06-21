from temporalio.client import Client
from temporalio.contrib.pydantic import pydantic_data_converter

from infrastructure.config.settings import TemporalSettings


async def connect(settings: TemporalSettings) -> Client:
    return await Client.connect(
        settings.host,
        namespace=settings.namespace,
        data_converter=pydantic_data_converter,
    )
