#!/bin/bash

# Start XAMPP services
echo "Starting Apache..."
sudo /Applications/XAMPP/xamppfiles/xampp startapache

echo "Starting MySQL..."
sudo /Applications/XAMPP/xamppfiles/xampp startmysql

echo "✅ XAMPP services started!"
echo ""
echo "Apache should be running at: http://localhost"
echo "MySQL should be running on port 3306"
