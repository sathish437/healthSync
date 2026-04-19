@echo off
echo ============================================
echo Setting up HealthSync (MySQL Version)...
echo ============================================

cd backend
echo Installing Backend Dependencies (Express, MySQL)...
call npm install --no-fund --no-audit

cd ..
cd frontend
echo Installing Frontend Dependencies (React, Vite, Framer Motion)...
call npm install --no-fund --no-audit


echo ============================================
echo Setup Complete!
echo ============================================
echo To run backend:  cd backend ^&^& npm run dev
echo To run frontend: cd frontend ^&^& npm run dev
echo ============================================
pause

