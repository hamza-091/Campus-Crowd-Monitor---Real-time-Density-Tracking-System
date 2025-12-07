# Campus Crowd Monitoring API - Endpoints Reference

## Base URL
\`http://localhost:8000\`

## Authentication
Most endpoints require JWT token. Get token from `/login`:

\`\`\`bash
curl -X POST "http://localhost:8000/login?username=admin&password=admin123"
\`\`\`

Response:
\`\`\`json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
\`\`\`

Use token in Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

---

## Endpoints

### 1. Login
\`\`\`
POST /login
Parameters:
  - username: str (required)
  - password: str (required)

Response:
{
  "access_token": "string",
  "token_type": "bearer"
}
\`\`\`

### 2. Get Status (All Locations)
\`\`\`
GET /status

Response:
{
  "locations": [
    {
      "id": 1,
      "name": "Cafeteria",
      "capacity": 30,
      "current_count": 15,
      "status": "NORMAL",
      "entry_closed": 0,
      "load_percentage": 50.0,
      "available_capacity": 15
    }
  ]
}
\`\`\`

### 3. Record Entry
\`\`\`
POST /enter
Parameters:
  - location_id: int (required)

Response:
{
  "success": true,
  "location": "Cafeteria",
  "current_count": 16,
  "capacity": 30,
  "status": "NORMAL"
}
\`\`\`

### 4. Record Exit
\`\`\`
POST /exit
Parameters:
  - location_id: int (required)

Response:
{
  "success": true,
  "location": "Cafeteria",
  "current_count": 15,
  "capacity": 30,
  "status": "NORMAL"
}
\`\`\`

### 5. Get Activity History
\`\`\`
GET /history
Parameters:
  - location_id: int (optional - filter by location)

Response:
{
  "logs": [
    {
      "id": 1,
      "location_id": 1,
      "action": "enter",
      "timestamp": "2024-01-15T10:30:00"
    }
  ]
}
\`\`\`

### 6. Get Alerts
\`\`\`
GET /alerts
Parameters:
  - limit: int (default: 50)

Response:
{
  "alerts": [
    {
      "id": 1,
      "location_id": 1,
      "location_name": "Cafeteria",
      "message": "Crowd approaching limit in Cafeteria (85%). Please slow entry.",
      "alert_type": "warning",
      "reroute_suggestion": "Admin Block",
      "timestamp": "2024-01-15T10:30:00"
    }
  ]
}
\`\`\`

### 7. Reset Counts (Admin Only)
\`\`\`
POST /reset
Headers:
  - Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "All counts reset"
}
\`\`\`

### 8. Health Check
\`\`\`
GET /

Response:
{
  "message": "Campus Crowd Monitoring System API",
  "version": "1.0.0"
}
\`\`\`

---

## Status Codes

- **200**: Success
- **401**: Unauthorized (invalid token or credentials)
- **404**: Resource not found
- **500**: Server error

---

## Examples

### Example 1: Full Workflow

\`\`\`bash
# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:8000/login?username=admin&password=admin123" | jq -r '.access_token')

# 2. Get current status
curl http://localhost:8000/status | jq

# 3. Record person entering Cafeteria (ID: 1)
curl -X POST "http://localhost:8000/enter?location_id=1" | jq

# 4. Check status again
curl http://localhost:8000/status | jq

# 5. Get alerts
curl http://localhost:8000/alerts | jq

# 6. Record person exiting
curl -X POST "http://localhost:8000/exit?location_id=1" | jq

# 7. Reset (admin only)
curl -H "Authorization: Bearer $TOKEN" -X POST "http://localhost:8000/reset" | jq
\`\`\`

### Example 2: Monitor Specific Location

\`\`\`bash
# Get activity for location 1 (Cafeteria)
curl "http://localhost:8000/history?location_id=1" | jq
\`\`\`

---

## Auto-Decision Engine Responses

### Normal Status
\`\`\`json
{
  "success": true,
  "status": "NORMAL",
  "message": "Entry open - Capacity available"
}
\`\`\`

### Warning Status (80%+ capacity)
\`\`\`json
{
  "success": true,
  "status": "WARNING",
  "message": "Crowd approaching limit. Please slow entry."
}
\`\`\`

### Critical Status (100%+ capacity)
\`\`\`json
{
  "success": false,
  "status": "CRITICAL",
  "message": "Entry closed due to overcapacity",
  "is_reroute": true,
  "reroute_location": "Admin Block"
}
\`\`\`
