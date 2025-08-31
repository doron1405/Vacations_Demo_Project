#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! pg_isready -h database -p 5432 -U postgres; do
    echo "Database not ready yet, waiting..."
    sleep 2
done
echo "Database is ready!"

# Wait a moment for database to fully initialize
sleep 3

# Start Vacation Statistics Dashboard
echo "Starting Vacation Statistics Dashboard..."

# Start supervisor to manage both nginx and Flask
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf