import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
from app.models.sqlalchemy_models import Base

# Hostnames updated to match your ims-postgres, ims-mongodb, and ims-redis containers
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql+asyncpg://admin:password123@ims-postgres:5432/ims_db")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://ims-mongodb:27017")
REDIS_URL = os.getenv("REDIS_URL", "redis://ims-redis:6379")

engine = create_async_engine(POSTGRES_URL, echo=False)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_pg_session():
    async with async_session_maker() as session:
        yield session

# Fixed: added uuidRepresentation to handle native Python UUIDs in MongoDB
mongo_client = AsyncIOMotorClient(MONGO_URL, uuidRepresentation='standard')
mongo_db = mongo_client.ims_datalake

def get_mongo_collection(): 
    return mongo_db.raw_signals

redis_pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)

def get_redis_client(): 
    return redis.Redis(connection_pool=redis_pool)
