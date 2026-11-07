from fastapi import FastAPI
from routers.router import router_api
from contextlib import asynccontextmanager
from utils.init_db import create_tables
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from core.config import Config


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(lifespan=lifespan, title="Ai Summary App Backend")

origins = Config.BACKEND_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_api)

handler = Mangum(app)