# Backend - Quick Start Guide

## One-Time Setup

### 1. Database Setup
Before running the backend, create the PostgreSQL database:

\`\`\`bash
# Connect to PostgreSQL
psql -U postgres

# Run these commands:
CREATE DATABASE campusdb;
\c campusdb

-- Create tables
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'NORMAL',
    entry_closed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    action VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    message VARCHAR(500),
    alert_type VARCHAR(50),
    reroute_suggestion VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Insert sample locations
INSERT INTO locations (name, capacity) VALUES
('Cafeteria', 30),
('Admin Block', 50),
('Academic Block', 150),
('Basketball Court', 20);
\`\`\`

### 2. Environment Setup

**On macOS/Linux:**
\`\`\`bash
# Run setup script
chmod +x setup.sh
./setup.sh
\`\`\`

**On Windows:**
\`\`\`bash
# Double-click setup.bat or run in terminal
setup.bat
\`\`\`

### 3. Configure .env

Edit `.env` file and update:
\`\`\`
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/campusdb
SECRET_KEY=your-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
\`\`\`

## Running the Backend

### Option 1: With Virtual Environment (Recommended)

\`\`\`bash
# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Run the server
uvicorn main:app --reload --port 8000
\`\`\`

### Option 2: Without Virtual Environment (if already installed)

\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

## Expected Output

\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
\`\`\`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Test API Endpoints

\`\`\`bash
# Get all locations
curl http://localhost:8000/status

# Record entry to location 1 (Cafeteria)
curl -X POST "http://localhost:8000/enter?location_id=1"

# Record exit
curl -X POST "http://localhost:8000/exit?location_id=1"

# Get history (last 50 records)
curl http://localhost:8000/history

# Get alerts
curl http://localhost:8000/alerts

# Login (returns JWT token)
curl -X POST "http://localhost:8000/login?username=admin&password=admin123"

# Reset counts (requires Bearer token from login)
# Replace TOKEN with the token from login response
curl -H "Authorization: Bearer TOKEN" -X POST "http://localhost:8000/reset"
\`\`\`

## Troubleshooting

### "Can't connect to database"
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env is correct
3. Verify database and tables exist (see Database Setup section)

### "ModuleNotFoundError"
1. Make sure virtual environment is activated
2. Run: \`pip install -r requirements.txt\`

### "Port 8000 already in use"
- Use a different port: \`uvicorn main:app --reload --port 8001\`

### "Invalid credentials" error
- Check ADMIN_USERNAME and ADMIN_PASSWORD in .env
- Default is: admin / admin123

---

## Next Steps
1. Start the backend: \`uvicorn main:app --reload --port 8000\`
2. Download and run the frontend (Next.js app from v0)
3. Access frontend at http://localhost:3000
4. Login with admin / admin123
