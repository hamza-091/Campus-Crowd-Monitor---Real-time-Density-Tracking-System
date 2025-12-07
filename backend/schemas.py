from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LocationStatus(BaseModel):
    id: int
    name: str
    capacity: int
    current_count: int
    status: str
    entry_closed: int
    load_percentage: float
    available_capacity: int
    
    class Config:
        from_attributes = True

class LogEntry(BaseModel):
    id: int
    location_id: int
    action: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class AlertEntry(BaseModel):
    id: int
    location_id: int
    message: str
    alert_type: str
    reroute_suggestion: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class RerouteResponse(BaseModel):
    location_id: int
    location_name: str
    suggested_location: str
    message: str
    is_reroute: bool
