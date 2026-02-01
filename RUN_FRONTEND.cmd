@echo off
setlocal

echo.
echo === BID FRONTEND ===
echo Working dir: %~dp0
echo.

cd /d "%~dp0" || exit /b 1

REM Use cmd.exe to avoid PowerShell npm.ps1 execution policy issues
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm not found. Please install Node.js ^(includes npm^) from:
  echo   https://nodejs.org/
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

echo Starting Vite on http://localhost:5173 ...
echo Press Ctrl+C to stop.
echo.

call npm run dev
