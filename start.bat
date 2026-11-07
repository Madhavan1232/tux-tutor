@echo off
setlocal
title Tux Tutor Launcher

echo ===================================================
echo               Starting Tux Tutor
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Launch Frontend
if exist "tux-tutor\package.json" (
    echo Starting Frontend Client Vite...
    start "Tux Tutor Frontend" cmd /k "cd tux-tutor && npm run dev"
) else (
    echo Starting Frontend Client Vite...
    start "Tux Tutor Frontend" cmd /k "npm run dev"
)

:: 2. Launch Backend
if exist "tux-tutor-server\package.json" (
    echo Starting Backend Server Express...
    start "Tux Tutor Backend" cmd /k "cd tux-tutor-server && npm run dev"
) else if exist "..\tux-tutor-server\package.json" (
    echo Starting Backend Server Express...
    start "Tux Tutor Backend" cmd /k "cd ..\tux-tutor-server && npm run dev"
) else (
    echo Error: tux-tutor-server folder not found!
)

echo.
echo ===================================================
echo Services launching:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
echo.
ping 127.0.0.1 -n 4 >nul
