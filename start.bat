@echo off
echo Starting Elnouzalaa SaaS Platform...

echo 1. Starting Databases (Postgres & Redis) via Docker...
docker-compose up -d

echo 2. Starting Backend (NestJS) on port 4000...
start cmd /k "cd backend && npm run start:dev"

echo 3. Starting Frontend (Next.js) on port 3001...
start cmd /k "cd frontend && npm run dev"

echo All services are starting up!
echo - Frontend: http://localhost:3001
echo - Backend API: http://localhost:4000/api
pause
