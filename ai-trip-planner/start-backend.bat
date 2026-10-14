@echo off
title TripBuddy Backend
cd /d %~dp0backend
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
python -u run.py
pause
