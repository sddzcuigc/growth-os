@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.13 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist "node_modules\libsql" (
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
node scripts/dev-server.mjs --open
pause
