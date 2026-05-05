@echo off
REM ============================================================
REM  Lumiere - start both storefronts in dev mode
REM    Shop  -> http://localhost:3000
REM    Rent  -> http://localhost:3001
REM ============================================================

setlocal
cd /d "%~dp0"

REM --- Stop any leftover dev servers from a previous run ---
echo [cleanup] Stopping any running Node dev servers...
taskkill /F /IM node.exe >nul 2>&1

REM --- Free ports 3000 and 3001 just in case ---
for %%P in (3000 3001) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING') do (
        taskkill /F /PID %%A >nul 2>&1
    )
)

REM --- Wipe stale Next.js build caches (prevents the "port open but
REM     requests hang forever" symptom after a previous failed compile) ---
echo [cleanup] Clearing .next build caches...
if exist "apps\shop\.next" rmdir /S /Q "apps\shop\.next"
if exist "apps\rent\.next" rmdir /S /Q "apps\rent\.next"

if not exist "node_modules" (
    echo [setup] Installing dependencies...
    call npm install
    if errorlevel 1 goto :err
)

if not exist "packages\db\node_modules\.prisma\client" (
    echo [setup] Generating Prisma client...
    call npm run db:generate
    if errorlevel 1 goto :err
)

echo [run] Launching Shop on http://localhost:3000
start "Lumiere Shop" cmd /k "cd /d %~dp0 && npm run dev:shop"

REM --- Small delay so the two next-dev processes don't race on the
REM     workspace's npm cache lock when they start simultaneously. ---
timeout /t 3 /nobreak >nul

echo [run] Launching Rent on http://localhost:3001
start "Lumiere Rent" cmd /k "cd /d %~dp0 && npm run dev:rent"

echo.
echo Both servers are starting in separate windows.
echo   Shop : http://localhost:3000
echo   Rent : http://localhost:3001
echo.
echo Close those windows (or press Ctrl+C in them) to stop.
endlocal
exit /b 0

:err
echo.
echo [error] Setup step failed. Aborting.
endlocal
exit /b 1
