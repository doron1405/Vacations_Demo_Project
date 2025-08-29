#!/bin/bash

# Wait for database to be ready (if needed)
echo "Starting Vacation Statistics Dashboard..."

# Start supervisor to manage both nginx and Flask
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

