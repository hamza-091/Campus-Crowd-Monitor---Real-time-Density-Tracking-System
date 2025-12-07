#!/usr/bin/env python3
"""
Simple script to run the FastAPI server
Usage: python run.py
"""

import subprocess
import sys
import os

def main():
    print("Campus Crowd Monitoring System - Backend Server")
    print("=" * 50)
    print()
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("WARNING: .env file not found!")
        print("Creating .env from .env.example...")
        if os.path.exists(".env.example"):
            with open(".env.example", "r") as src:
                with open(".env", "w") as dst:
                    dst.write(src.read())
            print("✓ .env created. Please update it with your database credentials!")
        else:
            print("ERROR: .env.example not found!")
            sys.exit(1)
    
    print("Starting FastAPI server...")
    print("API will be available at: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run(["uvicorn", "main:app", "--reload", "--port", "8000"])
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except FileNotFoundError:
        print("ERROR: uvicorn not found. Make sure dependencies are installed:")
        print("pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main()
