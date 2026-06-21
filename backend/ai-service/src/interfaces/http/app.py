from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from infrastructure.config import Settings
from interfaces.http.routes import assistant, metrics, screening


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(
        title=settings.app.name,
        version=settings.app.version,
        debug=settings.app.debug,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.hosts,
        allow_credentials=settings.cors.allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(metrics.router)
    app.include_router(assistant.router)
    app.include_router(screening.router)
    return app
