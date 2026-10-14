@echo off
title TripBuddy Planner Launcher
echo ===================================================
echo       Launching TripBuddy AI Travel Planner
echo ===================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "TripBuddy Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -u run.py"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "TripBuddy Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo Application successfully launched!
echo Open your browser at: http://localhost:5173
echo ===================================================
timeout /t 5 >nul
