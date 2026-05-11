@echo off
setlocal
title UniCore Launch System
color 0E

echo ==========================================
echo    UNICORE ACADEMIC GOVERNANCE NETWORK
echo         Powered by NexaVision
echo ==========================================
echo.

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Initializing System Nodes...

:: Start Backend in a separate window
echo [2/3] Booting Backend Server...
cd UniCore\backend
start /min "UniCore Backend" cmd /c "npm run dev"
timeout /t 5 >nul

:: Start Frontend and Open Browser
echo [3/3] Launching Frontend Interface...
cd ..\frontend
start http://localhost:5173
npm run dev

echo.
echo ==========================================
echo    SYSTEM ONLINE: http://localhost:5173
echo ==========================================
echo.
pause
