#!/bin/bash

echo "Campus Crowd Monitoring System - Backend Setup Script"
echo "====================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your PostgreSQL credentials"
echo "2. Make sure PostgreSQL is running"
echo "3. Run: uvicorn main:app --reload --port 8000"
echo ""
