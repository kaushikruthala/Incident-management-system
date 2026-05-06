from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.sqlalchemy_models import SeverityLevel, WorkItemStatus

class SignalIngestRequest(BaseModel):
    component_id: str
    severity: SeverityLevel
    payload: Dict[str, Any]

class RCARequest(BaseModel):
    root_cause_category: str
    fix_applied: str
    prevention_steps: str
    incident_start: datetime
    incident_end: datetime

class WorkItemUpdateRequest(BaseModel):
    status: WorkItemStatus
    rca: Optional[RCARequest] = None

class WorkItemResponse(BaseModel):
    id: UUID
    component_id: str
    severity: SeverityLevel
    status: WorkItemStatus
    first_signal_at: datetime
    resolved_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class SignalResponse(BaseModel):
    id: str
    work_item_id: UUID
    payload: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
