import asyncio, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.incidents import router
from app.db.session import get_redis_client, init_db, get_mongo_collection, async_session_maker
from app.workers.signal_consumer import signal_consumer_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    redis_client = get_redis_client()
    consumer_task = asyncio.create_task(
        signal_consumer_worker(async_session_maker, get_mongo_collection(), redis_client)
    )
    yield
    consumer_task.cancel()

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api/v1")