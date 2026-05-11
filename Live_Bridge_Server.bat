@echo off
setlocal
title UniCore Live Bridge Server
color 0A

echo ==========================================
echo    UNICORE: LIVE BRIDGE & SERVER
echo ==========================================
echo.

:: 1. Start Backend in separate window
echo [1/3] Starting Backend Server...
cd UniCore\backend
start /min "UniCore Backend" cmd /c "npm run dev"
timeout /t 5 >nul

:: 2. Seed Database (Safe to run multiple times if seeder is idempotent or clears first)
echo [2/3] Preparing System Registry (Seeding)...
node src/utils/seeder.js
echo [OK] Registry Prepared.

:: 3. Start Localtunnel
echo [3/3] Creating Live Public Link...
echo.
echo ------------------------------------------
echo IMPORTANT: Copy the URL below and send it 
echo to users or use it in your Vercel Config.
echo ------------------------------------------
echo.

:: We use a fixed subdomain if possible, but random is safer for first run
npx localtunnel --port 5000
