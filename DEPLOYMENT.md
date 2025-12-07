# Campus Crowd Density Monitoring System - Deployment Guide

## Overview
This is a full-stack production-grade system with Python FastAPI backend and Next.js frontend.

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- pip (Python package manager)
- npm or yarn

## Backend Setup

### 1. Database Configuration

\`\`\`bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE campusdb;

# Connect to the database
\c campusdb

# Run the schema
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  capacity INT,
  current_count INT DEFAULT 0,
  status TEXT DEFAULT 'NORMAL',
  entry_closed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  location_id INT REFERENCES locations(id),
  action TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  location_id INT REFERENCES locations(id),
  message TEXT,
  alert_type TEXT,
  reroute_suggestion TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Exit psql
\q
\`\`\`

### 2. Install Dependencies

\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### 3. Configure Environment

Create `.env` in backend directory:

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/campusdb
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
\`\`\`

### 4. Run FastAPI Server

\`\`\`bash
cd backend
uvicorn main:app --reload --port 8000
\`\`\`

The API will be available at `http://localhost:8000`
Documentation: `http://localhost:8000/docs`

## Frontend Setup

### 1. Install Dependencies

\`\`\`bash
cd frontend
npm install
\`\`\`

### 2. Configure Environment

Create `.env.local` in frontend directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The dashboard will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /login` - Admin login
  - Query params: `username`, `password`
  - Returns: `access_token`, `token_type`

### Crowd Management
- `POST /enter` - Record entry (Query: `location_id`)
- `POST /exit` - Record exit (Query: `location_id`)
- `GET /status` - Get all locations status
- `GET /history` - Get activity history (Optional Query: `location_id`)
- `GET /alerts` - Get auto-generated alerts
- `POST /reset` - Reset all counts (Admin only, requires Bearer token)

## Example Usage

### Enter a location
\`\`\`bash
curl -X POST "http://localhost:8000/enter?location_id=1"
\`\`\`

### Exit a location
\`\`\`bash
curl -X POST "http://localhost:8000/exit?location_id=1"
\`\`\`

### Get status
\`\`\`bash
curl "http://localhost:8000/status"
\`\`\`

### Admin login
\`\`\`bash
curl -X POST "http://localhost:8000/login?username=admin&password=admin123"
\`\`\`

## Key Features

### Auto-Decision Engine
- **Warning (80%)**: Highlights location, displays warning message
- **Critical (100%+)**: 
  - Automatically closes entry
  - Suggests nearest safe location
  - Generates intelligent alert
  - Saves to database

### Real-time Monitoring
- Dashboard updates every 3 seconds
- Live crowd counts and capacity indicators
- Status badges (Normal/Warning/Critical/Entry Closed)
- Load percentage visualization

### Analytics
- Activity history tracking
- Crowd trend visualization (10-minute chart)
- Load comparison across locations
- Timestamp-accurate logging

## Production Deployment

### Backend (Heroku/Railway/AWS)
1. Set environment variables on hosting platform
2. Connect database
3. Deploy with: `gunicorn main:app`

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to production API
3. Deploy automatically

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**Important**: Change these in production!

## Campus Locations
- Cafeteria (30 capacity)
- Admin Block (50 capacity)
- Academic Block (150 capacity)
- Basketball Court (20 capacity)

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### CORS Issues
- Backend CORS is enabled for all origins (development)
- Update in production to specific frontend URL

### API Not Responding
- Check FastAPI server is running
- Verify port 8000 is available
- Check firewall settings

## Support
For issues or questions, refer to the code documentation and comments throughout the system.
