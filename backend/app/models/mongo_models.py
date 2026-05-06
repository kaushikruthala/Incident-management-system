from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

class RawSignal(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    component_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    work_item_id: Optional[UUID] = None
    payload: Dict[str, Any]
    model_config = ConfigDict(populate_by_name=True)
