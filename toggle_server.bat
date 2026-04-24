@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Always run from this batch file directory.
cd /d "%~dp0"

set "PORT=5173"
set "TITLE=Vite_Local_Server"
set "FOUND=0"
set "KILL_FAILED=0"

echo ==========================================
echo [CHECK] Inspecting local server status...
echo ==========================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set "FOUND=1"
    echo [ACTION] Stopping PID %%a on port %PORT%...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 set "KILL_FAILED=1"
)

if "%FOUND%"=="1" (
    if "%KILL_FAILED%"=="1" (
        echo [ERROR] Failed to stop one or more processes on port %PORT%.
        echo [HINT] Try running this script as administrator.
    ) else (
        echo [OK] Existing server process stopped.
    )
) else (
    echo [STATUS] Port %PORT% is free.
    echo [ACTION] Starting server with npm run dev...
    start "%TITLE%" /min cmd /c "cd /d ""%~dp0"" && call npm run dev"
    echo [OK] Start command sent.
    echo URL: http://localhost:%PORT%
)

echo ==========================================
echo This window will close in 3 seconds.
timeout /t 3 >nul