import asyncio, logging
from uuid import UUID
from datetime import datetime
from app.models.sqlalchemy_models import WorkItem
from app.services.alerting_strategy import AlertContext

logger = logging.getLogger(__name__)
signal_queue = asyncio.Queue(maxsize=50000)
metrics = {"processed_count": 0}

async def process_batch(signals, pg_session, mongo_collection, redis_client):
    raw_to_insert = []
    for sig in signals:
        debounce_key = f"debounce:{sig.component_id}"
        existing = await redis_client.get(debounce_key)
        if existing:
            work_item_uuid = UUID(existing)
        else:
            new_item = WorkItem(component_id=sig.component_id, severity=sig.severity)
            pg_session.add(new_item)
            await pg_session.commit()
            await pg_session.refresh(new_item)
            work_item_uuid = new_item.id
            await redis_client.setex(debounce_key, 10, str(work_item_uuid))
            asyncio.create_task(AlertContext.trigger_alert(sig.severity, sig.component_id, sig.payload))
        
        raw_to_insert.append({
            "component_id": sig.component_id, 
            "work_item_id": work_item_uuid, 
            "payload": sig.payload, 
            "timestamp": datetime.utcnow()
        })
    if raw_to_insert:
        await mongo_collection.insert_many(raw_to_insert)
        metrics["processed_count"] += len(raw_to_insert)

async def signal_consumer_worker(async_session_maker, mongo_coll, redis_client):
    while True:
        try:
            batch = [await signal_queue.get()]
            signal_queue.task_done()
            while len(batch) < 500 and not signal_queue.empty():
                batch.append(signal_queue.get_nowait())
                signal_queue.task_done()
            async with async_session_maker() as session:
                await process_batch(batch, session, mongo_coll, redis_client)
        except Exception as e:
            logger.error(f"Worker Error: {e}")
            await asyncio.sleep(1)