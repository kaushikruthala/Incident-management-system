import enum, uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum as SAEnum, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class SeverityLevel(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"

class WorkItemStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class WorkItem(Base):
    __tablename__ = "work_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(String(255), nullable=False, index=True)
    severity = Column(SAEnum(SeverityLevel), nullable=False)
    status = Column(SAEnum(WorkItemStatus), default=WorkItemStatus.OPEN, nullable=False)
    first_signal_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    rca = relationship("RCARecord", back_populates="work_item", uselist=False, cascade="all, delete-orphan")
    __table_args__ = (Index("ix_component_status", "component_id", "status"),)

    @property
    def mttr_seconds(self):
        if self.resolved_at and self.first_signal_at:
            return (self.resolved_at - self.first_signal_at).total_seconds()
        return None

class RCARecord(Base):
    __tablename__ = "rca_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_item_id = Column(UUID(as_uuid=True), ForeignKey("work_items.id", ondelete="CASCADE"), unique=True, nullable=False)
    root_cause_category = Column(String(100), nullable=False)
    fix_applied = Column(Text, nullable=False)
    prevention_steps = Column(Text, nullable=False)
    incident_start = Column(DateTime(timezone=True), nullable=False)
    incident_end = Column(DateTime(timezone=True), nullable=False)
    work_item = relationship("WorkItem", back_populates="rca")
