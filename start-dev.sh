#!/bin/bash

# Copy the environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi

# Start only the database services
echo "Starting database services (PostgreSQL, MongoDB, MySQL, Redis)..."
docker compose up -d postgres mongodb mysql redis

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 5

# Copy the local environment file to the backend if needed
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file from backend/.env.local"
    cp backend/.env.local backend/.env
fi

echo ""
echo "Database services are running!"
echo ""
echo "Start backend with: cd backend && python manage.py runserver"
echo "Start frontend with: cd frontend && npm run dev"
echo ""
echo "To stop services run: docker compose down" 