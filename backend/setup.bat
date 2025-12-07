@echo off
REM Campus Crowd Monitoring System - Backend Setup Script for Windows

echo Campus Crowd Monitoring System - Backend Setup Script
echo =====================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo Python found

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your PostgreSQL credentials
echo 2. Make sure PostgreSQL is running
echo 3. Run: uvicorn main:app --reload --port 8000
echo.
pause
