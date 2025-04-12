#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
    echo "Please review the .env file and update any necessary values."
    echo "Then run this script again."
    exit 1
fi

# Set production environment
export DJANGO_ENV=prod

# Build and start all services
echo "Building and starting all services..."
docker compose build
docker compose up -d

echo ""
echo "All services are running!"
echo ""
echo "Frontend available at: http://localhost:${FRONTEND_PORT:-80}"
echo "Backend API available at: http://localhost:${BACKEND_PORT:-8000}/api/"
echo ""
echo "To stop all services run: docker compose down" 