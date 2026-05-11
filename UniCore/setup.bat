@echo off
title EduBridge Setup
echo.
echo ==========================================
echo   EduBridge University Management System
echo   NexaVision Technologies
echo ==========================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (echo Node.js not found. Install from nodejs.org & pause & exit /b 1)
echo [OK] Node.js detected

echo.
echo Installing backend...
cd backend && call npm install
if %errorlevel% neq 0 (echo Backend install failed & pause & exit /b 1)
echo [OK] Backend installed

echo.
echo Installing frontend...
cd ..\frontend && call npm install
if %errorlevel% neq 0 (echo Frontend install failed & pause & exit /b 1)
echo [OK] Frontend installed

cd ..
echo.
set /p seed="Seed database with sample data? (y/n): "
if /i "%seed%"=="y" (cd backend && call npm run seed && cd ..)

echo.
echo ==========================================
echo   DONE! Run these in 2 terminals:
echo.
echo   Terminal 1:  cd backend  && npm run dev
echo   Terminal 2:  cd frontend && npm run dev
echo.
echo   Open: http://localhost:5173
echo.
echo   admin@edubridge.edu    / Admin@123
echo   teacher@edubridge.edu  / Teacher@123
echo   student@edubridge.edu  / Student@123
echo ==========================================
echo.
pause
