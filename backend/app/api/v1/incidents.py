from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.schemas import SignalIngestRequest, WorkItemResponse, WorkItemUpdateRequest
from app.models.sqlalchemy_models import WorkItem, RCARecord
from app.workers.signal_consumer import signal_queue
from app.db.session import get_pg_session, get_mongo_collection

router = APIRouter()

@router.post("/signals", status_code=status.HTTP_202_ACCEPTED)
async def ingest(payload: SignalIngestRequest):
    try:
        signal_queue.put_nowait(payload)
        return {"status": "accepted"}
    except:
        raise HTTPException(status_code=503, detail="Buffer full")

@router.get("/incidents", response_model=list[WorkItemResponse])
async def get_incidents(db: AsyncSession = Depends(get_pg_session)):
    result = await db.execute(select(WorkItem))
    return result.scalars().all()

@router.get("/incidents/{item_id}/signals")
async def get_signals(item_id: str, mongo=Depends(get_mongo_collection)):
    cursor = mongo.find({"work_item_id": item_id}).sort("timestamp", -1).limit(100)
    return [doc async for doc in cursor]

@router.patch("/incidents/{item_id}", response_model=WorkItemResponse)
async def update_incident(item_id: str, req: WorkItemUpdateRequest, db: AsyncSession = Depends(get_pg_session)):
    result = await db.execute(select(WorkItem).where(WorkItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item: raise HTTPException(status_code=404)
    
    item.status = req.status
    if req.rca:
        rca = RCARecord(work_item_id=item.id, **req.rca.model_dump())
        db.add(rca)
    await db.commit()
    await db.refresh(item)
    return item

