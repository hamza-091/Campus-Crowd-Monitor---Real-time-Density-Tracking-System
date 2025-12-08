import random
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from database import get_db, engine, Base
from models import Location, Log, Alert
from schemas import LocationStatus, LogEntry, AlertEntry, RerouteResponse
from auth import create_access_token, verify_token, get_password_hash, verify_password
from config import settings
from decision_engine import AutoDecisionEngine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Crowd Monitoring", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Initialize data on startup
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    locations_data = [
        {"name": "Cafeteria", "capacity": 30},
        {"name": "Admin Block", "capacity": 50},
        {"name": "Academic Block", "capacity": 150},
        {"name": "Basketball Court", "capacity": 20}
    ]
    for loc_data in locations_data:
        existing = db.query(Location).filter(Location.name == loc_data["name"]).first()
        if not existing:
            db.add(Location(name=loc_data["name"], capacity=loc_data["capacity"]))
    db.commit()
    db.close()

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload or payload.get("sub") != "admin":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return payload

@app.post("/login")
def login(username: str, password: str):
    """Admin login endpoint"""
    if username != settings.ADMIN_USERNAME or password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": "admin"}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/enter")
def enter_location(location_id: int, db: Session = Depends(get_db)):
    """Record when a person enters a location"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # HARD LIMIT CHECK: Do not allow entry if already at Capacity + 1
    if location.current_count >= location.capacity + 1:
         return {
            "success": False, 
            "message": f"Physical limit reached for {location.name}. Cannot add more people.",
            "is_reroute": False
        }

    # Check if entry is closed (Soft Limit)
    if location.entry_closed:
        return {
            "success": False, 
            "message": f"Entry to {location.name} is currently closed due to high crowd density.",
            "is_reroute": True,
            "reroute_location": AutoDecisionEngine.find_best_reroute(
                location.name, 
                {loc.name: {"available_capacity": loc.capacity - loc.current_count} for loc in db.query(Location).all()}
            )
        }

    # Increment count
    location.current_count += 1
    
    # Determine status
    status = AutoDecisionEngine.determine_status(location.current_count, location.capacity)
    location.status = status
    
    # Check if we need to close entry (exceeds capacity)
    if location.current_count > location.capacity:
        location.entry_closed = 1
        # Find best reroute
        available_locs = {loc.name: {"available_capacity": loc.capacity - loc.current_count} for loc in db.query(Location).all()}
        reroute = AutoDecisionEngine.find_best_reroute(location.name, available_locs)
        
        # Generate alert
        message = AutoDecisionEngine.generate_alert_message(
            location.name, location.current_count, location.capacity, reroute
        )
        alert = Alert(
            location_id=location_id,
            message=message,
            alert_type="critical",
            reroute_suggestion=reroute
        )
        db.add(alert)

    # Log the entry
    log = Log(location_id=location_id, action="enter")
    db.add(log)
    
    db.commit()
    return {
        "success": True, 
        "location": location.name, 
        "current_count": location.current_count, 
        "capacity": location.capacity,
        "status": location.status
    }

@app.post("/exit")
def exit_location(location_id: int, db: Session = Depends(get_db)):
    """Record when a person leaves a location"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Decrement count (don't go below 0)
    if location.current_count > 0:
        location.current_count -= 1
    
    # Determine new status
    status = AutoDecisionEngine.determine_status(location.current_count, location.capacity)
    location.status = status
    
    # If count drops below capacity, reopen entry
    if location.current_count <= location.capacity:
        location.entry_closed = 0
        
    # Log the exit
    log = Log(location_id=location_id, action="exit")
    db.add(log)
    
    db.commit()
    return {
        "success": True, 
        "location": location.name, 
        "current_count": location.current_count, 
        "capacity": location.capacity,
        "status": location.status
    }

@app.get("/status")
def get_status(db: Session = Depends(get_db)):
    """Get live status of all locations"""
    locations = db.query(Location).all()
    return {
        "locations": [
            LocationStatus(
                id=loc.id,
                name=loc.name,
                capacity=loc.capacity,
                current_count=loc.current_count,
                status=loc.status,
                entry_closed=loc.entry_closed,
                load_percentage=AutoDecisionEngine.get_load_percentage(loc.current_count, loc.capacity),
                available_capacity=max(0, loc.capacity - loc.current_count)
            ) for loc in locations
        ]
    }

@app.get("/history")
def get_history(location_id: int = None, db: Session = Depends(get_db)):
    """Get last 50 records"""
    query = db.query(Log).order_by(Log.timestamp.desc()).limit(50)
    if location_id:
        query = query.filter(Log.location_id == location_id)
    logs = query.all()
    return {"logs": [LogEntry.from_orm(log) for log in reversed(logs)]}

@app.get("/alerts")
def get_alerts(limit: int = 50, db: Session = Depends(get_db)):
    """Get auto-generated alerts"""
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(limit).all()
    # Enrich with location names
    result = []
    for alert in reversed(alerts):
        location = db.query(Location).filter(Location.id == alert.location_id).first()
        alert_dict = AlertEntry.from_orm(alert).model_dump()
        alert_dict["location_name"] = location.name if location else "Unknown"
        result.append(alert_dict)
    return {"alerts": result}

@app.post("/reset")
def reset_counts(db: Session = Depends(get_db)):
    """Reset crowd counts (Public for demo)"""
    db.query(Location).update({"current_count": 0, "status": "NORMAL", "entry_closed": 0})
    db.commit()
    return {"success": True, "message": "All counts reset"}

@app.post("/simulate")
def simulate_crowd(db: Session = Depends(get_db)):
    """Simulate random crowd movements for demo purposes"""
    locations = db.query(Location).all()
    changes = []

    for loc in locations:
        # If entry is closed (Over capacity), force reduction or stay same
        if loc.entry_closed == 1:
            change = random.randint(-3, 0)
        # If full (Capacity reached), prevent adding more than 1 over limit
        elif loc.current_count >= loc.capacity:
             change = random.randint(-2, 1) # Can only go +1 max
        else:
            change = random.randint(-3, 5)
        
        if change == 0:
            continue
            
        new_count = loc.current_count + change
        
        # HARD LIMIT: Clamp between 0 and Capacity + 1
        loc.current_count = max(0, min(new_count, loc.capacity + 1))

        # Determine status
        loc.status = AutoDecisionEngine.determine_status(loc.current_count, loc.capacity)
        
        # Handle entry closure logic
        if loc.current_count > loc.capacity:
            if loc.entry_closed == 0:
                loc.entry_closed = 1
                available_locs = {l.name: {"available_capacity": l.capacity - l.current_count} for l in db.query(Location).all()}
                reroute = AutoDecisionEngine.find_best_reroute(loc.name, available_locs)
                message = AutoDecisionEngine.generate_alert_message(loc.name, loc.current_count, loc.capacity, reroute)
                db.add(Alert(location_id=loc.id, message=message, alert_type="critical", reroute_suggestion=reroute))
        else:
            if loc.current_count <= loc.capacity:
                loc.entry_closed = 0

        changes.append({"location": loc.name, "change": change, "new_count": loc.current_count})

    db.commit()
    return {"success": True, "changes": changes}

@app.get("/forecast/{location_id}")
def get_forecast(location_id: int, db: Session = Depends(get_db)):
    """
    Returns predicted crowd levels for the next 4 hours.
    """
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    pkt_now = datetime.utcnow() + timedelta(hours=5)
    current_hour_pkt = pkt_now.hour
    
    forecast = []
    
    for i in range(5): 
        hour = (current_hour_pkt + i) % 24
        next_time = pkt_now + timedelta(hours=i)
        
        if 11 <= hour <= 14:
            base_load = 0.8
        elif 17 <= hour <= 19:
            base_load = 0.6
        elif 22 <= hour or hour <= 6:
            base_load = 0.1
        else:
            base_load = 0.3
            
        predicted_load = min(1.0, max(0.0, base_load + random.uniform(-0.1, 0.1)))
        predicted_count = int(location.capacity * predicted_load)
        
        forecast.append({
            "time": next_time.strftime("%I:%M %p"),
            "predicted_count": predicted_count,
            "capacity": location.capacity,
            "load_percentage": int(predicted_load * 100)
        })
        
    return {"location": location.name, "forecast": forecast}

@app.get("/")
def root():
    return {"message": "Campus Crowd Monitoring System API", "version": "1.0.0"}