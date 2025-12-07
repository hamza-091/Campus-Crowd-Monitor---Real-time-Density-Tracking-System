# Campus Crowd Monitoring System - Complete Setup Guide

## Architecture Overview
- **Frontend**: Next.js (React) - Runs on localhost:3000
- **Backend**: FastAPI (Python) - Runs on localhost:8000
- **Database**: PostgreSQL - Stores all data

---

## DATABASE SETUP (SQL Commands)

### Step 1: Create PostgreSQL Database

Run these commands in your PostgreSQL shell or client:

\`\`\`sql
-- Create the database
CREATE DATABASE campusdb;

-- Connect to the database
\c campusdb

-- Create locations table
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

-- Create logs table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    action VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Create alerts table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    message VARCHAR(500),
    alert_type VARCHAR(50),
    reroute_suggestion VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Create indexes for performance
CREATE INDEX idx_logs_location_id ON logs(location_id);
CREATE INDEX idx_alerts_location_id ON alerts(location_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);

-- Verify tables created
\dt
\`\`\`

### Step 2: Insert Sample Data

\`\`\`sql
-- Insert sample locations
INSERT INTO locations (name, capacity) VALUES
('Cafeteria', 30),
('Admin Block', 50),
('Academic Block', 150),
('Basketball Court', 20);

-- Verify data
SELECT * FROM locations;
\`\`\`

---

## BACKEND SETUP (Python)

### Step 1: Create Backend Folder

\`\`\`bash
# Create and navigate to backend folder
mkdir campus-crowd-backend
cd campus-crowd-backend
\`\`\`

### Step 2: Create Python Virtual Environment

\`\`\`bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
\`\`\`

### Step 3: Create requirements.txt

Create a file named `requirements.txt` with:
\`\`\`
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
PyJWT==2.8.1
passlib==1.7.4
bcrypt==4.1.1
python-multipart==0.0.6
\`\`\`

### Step 4: Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 5: Create .env File

Create a file named `.env` in the backend folder:
\`\`\`
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/campusdb
SECRET_KEY=your-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
\`\`\`

**IMPORTANT**: Replace `your_password` with your actual PostgreSQL password!

### Step 6: Copy Backend Python Files

Copy these 7 Python files into your `campus-crowd-backend` folder:
- config.py
- database.py
- models.py
- schemas.py
- auth.py
- decision_engine.py
- main.py

### Step 7: Run the Backend Server

\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

You should see:
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
\`\`\`

---

## FRONTEND SETUP (Already in v0)

### Step 1: Download the Frontend

1. In v0, click the three dots in the top right
2. Select "Download ZIP"
3. Extract the ZIP file

### Step 2: Install Frontend Dependencies

\`\`\`bash
cd extracted-folder
npm install
# or
pnpm install
\`\`\`

### Step 3: Create .env.local

Create a file named `.env.local` in the frontend root:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

### Step 4: Run Frontend

\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

Access at: **http://localhost:3000**

---

## TESTING THE SYSTEM

### Test 1: Login
1. Go to http://localhost:3000
2. Username: `admin`
3. Password: `admin123`
4. Click Login

### Test 2: View Dashboard
After login, you should see:
- 4 campus locations
- Current crowd counts
- Status indicators (NORMAL/WARNING/CRITICAL)
- Load percentages

### Test 3: Test API Endpoints Directly

Open a new terminal and run these commands:

\`\`\`bash
# Get all locations
curl http://localhost:8000/status

# Record an entry to Cafeteria (location_id=1)
curl -X POST "http://localhost:8000/enter?location_id=1"

# Record an exit
curl -X POST "http://localhost:8000/exit?location_id=1"

# Get activity history
curl http://localhost:8000/history

# Get alerts
curl http://localhost:8000/alerts
\`\`\`

---

## TROUBLESHOOTING

### "Error: connection refused" when starting backend
- PostgreSQL is not running. Start it:
  - **macOS**: `brew services start postgresql`
  - **Windows**: Use PostgreSQL Services app
  - **Linux**: `sudo systemctl start postgresql`

### "FATAL: role 'postgres' does not exist"
- You haven't set up PostgreSQL user. Run:
  \`\`\`bash
  createuser -s postgres
  \`\`\`

### "Database 'campusdb' does not exist"
- Run the SQL commands in "DATABASE SETUP" section above

### "Can't connect to localhost:8000" from frontend
- Backend is not running. Make sure `uvicorn main:app --reload` is running
- Check CORS is enabled (it is in main.py)
- Verify DATABASE_URL in .env is correct

### "Invalid credentials" on login
- Username must be: `admin`
- Password must be: `admin123`
- These are defined in config.py

---

## PROJECT STRUCTURE

\`\`\`
campus-crowd-backend/
├── main.py                 # FastAPI app & routes
├── config.py               # Settings
├── database.py             # SQLAlchemy setup
├── models.py               # Database models
├── schemas.py              # Pydantic schemas
├── auth.py                 # JWT token handling
├── decision_engine.py      # Auto-decision logic
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables

frontend/ (Next.js app in v0)
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── login-page.tsx
│   ├── dashboard.tsx
│   ├── location-card.tsx
│   └── ...
└── .env.local
\`\`\`

---

## AUTO-DECISION ENGINE FEATURES

1. **Status Detection**:
   - NORMAL: 0-79% capacity
   - WARNING: 80-99% capacity
   - CRITICAL: 100%+ capacity

2. **Auto Entry Closure**:
   - When location exceeds capacity, entry is automatically closed
   - Status changes to CRITICAL
   - Alert is generated

3. **Smart Rerouting**:
   - Suggests nearby locations with available capacity
   - Reroute map:
     - Cafeteria → Admin Block, Academic Block
     - Admin Block → Academic Block, Basketball Court
     - Academic Block → Admin Block, Basketball Court
     - Basketball Court → Cafeteria, Admin Block

4. **Alert Generation**:
   - Automatic alerts when thresholds are crossed
   - Stored in database with timestamp
   - Visible in frontend alert panel

---

## NEXT STEPS

1. Set up PostgreSQL database (use SQL commands above)
2. Set up backend (follow Backend Setup section)
3. Download and setup frontend (follow Frontend Setup section)
4. Test using the Testing section
5. Monitor the dashboard!

---

## SUPPORT

For issues:
1. Check TROUBLESHOOTING section
2. Verify all services are running (PostgreSQL, Backend, Frontend)
3. Check .env files have correct values
4. Review console logs for error messages
\`\`\`

---

```bash file="" isHidden
