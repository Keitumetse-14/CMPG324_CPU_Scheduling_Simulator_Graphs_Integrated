@echo off
python -m uvicorn api.main:app --reload --port 8000
