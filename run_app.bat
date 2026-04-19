@echo off
echo ============================================
echo 🩺 HealthSync Indigo: Auto-Repairing DB...
echo ============================================

cd backend
call npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ FAILED TO INITIALIZE DATABASE.
    echo Please check your MySQL credentials in backend/.env
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Database is healthy. Starting services...
echo.

start cmd /k "npm run dev"
cd ..
start cmd /k "cd frontend && npm run dev"

echo.
echo Services are launching in separate windows.
echo.
pause
