@echo off
setlocal
title Tux Tutor Launcher

echo ===================================================
echo               Starting Tux Tutor
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Free default ports (5173 for Frontend Vite, 5000 for Backend Express)
echo Checking default ports (5173, 5000)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "5173, 5000 | ForEach-Object { $port = $_; $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conns) { $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($procId in $pids) { if ($procId -and $procId -ne 0) { Write-Host ('[Free Port] Terminating existing process on port ' + $port + ' (PID: ' + $procId + ')...'); Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue; cmd /c ('taskkill /F /T /PID ' + $procId + ' >nul 2>&1') } } } }; Start-Sleep -Milliseconds 600"

:: Fallback check with netstat & taskkill in case any orphaned listener remains
for %%P in (5173 5000) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%%P\>.*LISTENING"') do (
        if not "%%a"=="0" (
            echo [Free Port] Terminating stubborn process on port %%P (PID: %%a)...
            taskkill /F /T /PID %%a >nul 2>&1
        )
    )
)

echo Ports 5173 and 5000 are clear.
echo.

:: 1. Launch Frontend
if exist "tux-tutor\package.json" (
    echo Starting Frontend Client Vite on http://localhost:5173...
    start "Tux Tutor Frontend" cmd /k "cd tux-tutor && npm run dev"
) else (
    echo Starting Frontend Client Vite on http://localhost:5173...
    start "Tux Tutor Frontend" cmd /k "npm run dev"
)

:: 2. Launch Backend
if exist "tux-tutor-server\package.json" (
    echo Starting Backend Server Express on http://localhost:5000...
    start "Tux Tutor Backend" cmd /k "cd tux-tutor-server && npm run dev"
) else if exist "..\tux-tutor-server\package.json" (
    echo Starting Backend Server Express on http://localhost:5000...
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
