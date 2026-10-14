@echo off
title TripBuddy Frontend
cd /d %~dp0frontend
echo Starting React Vite Frontend on http://localhost:5173 ...
npm run dev
pause
