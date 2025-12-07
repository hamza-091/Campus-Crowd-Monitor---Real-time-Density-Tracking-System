from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    capacity = Column(Integer)
    current_count = Column(Integer, default=0)
    status = Column(String, default="NORMAL")  # NORMAL, WARNING, CRITICAL, ENTRY_CLOSED
    entry_closed = Column(Integer, default=0)  # Boolean: 1 = closed, 0 = open
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, index=True)
    action = Column(String)  # enter, exit
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, index=True)
    message = Column(String)
    alert_type = Column(String)  # warning, critical, reroute
    reroute_suggestion = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
