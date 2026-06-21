from fastapi import HTTPException, Request

from infrastructure.config import Settings


def get_settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def verify_internal_token(request: Request) -> None:
    settings = get_settings(request)
    token = request.headers.get("X-Internal-Token", "")
    if token != settings.internal.service_token:
        raise HTTPException(status_code=401, detail="unauthorized")
