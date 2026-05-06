import logging
from app.models.sqlalchemy_models import SeverityLevel
logger = logging.getLogger(__name__)

class AlertContext:
    @classmethod
    async def trigger_alert(cls, severity, component_id, payload):
        if severity == SeverityLevel.P0:
            logger.critical(f"🚨 [P0 ALERT] IMMEDIATE ACTION: {component_id} FAILED!")
        elif severity == SeverityLevel.P1:
            logger.error(f"⚠️ [P1 ALERT] Major impact on {component_id}.")
        else:
            logger.warning(f"🔔 [P2 ALERT] Performance issue on {component_id}.")
