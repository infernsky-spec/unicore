@echo off
setlocal
title UniCore — Publish to GitHub
color 0B

echo ==========================================
echo    UNICORE: SHIP TO GITHUB
echo ==========================================
echo.

:: Check for Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git not found. Please install from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] Initializing Git Repository...
git init

echo [2/4] Adding files...
git add .

echo [3/4] Creating first commit...
git commit -m "Initial release of UniCore v4.5 (Academic Governance Network)"

echo.
echo [4/4] SHIPMENT INSTRUCTIONS:
echo ------------------------------------------
echo 1. Go to: https://github.com/new
echo 2. Name your repository: "unicore" (or similar)
echo 3. Click "Create Repository"
echo 4. Copy the URL of your new repository.
echo.
set /p repo_url="Enter your GitHub Repository URL (e.g., https://github.com/YourName/unicore.git): "

if "%repo_url%"=="" (
    echo [SKIP] No URL entered. Repository initialized locally.
) else (
    echo.
    echo [CONNECTING] Linking to %repo_url%...
    git remote add origin %repo_url%
    git branch -M main
    echo [PUSHING] Uploading code to GitHub...
    git push -u origin main
    echo.
    echo ==========================================
    echo    SUCCESS! Your project is now LIVE.
    echo    View it at: %repo_url%
    echo ==========================================
)

echo.
pause
