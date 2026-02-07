#!/bin/bash

# Start PHP development server on port 8000 using XAMPP PHP
echo "🚀 Starting PHP development server on http://localhost:8000"
echo "📁 Serving from: $(pwd)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd /Applications/XAMPP/xamppfiles/htdocs/lydia

# Use XAMPP's PHP if available, otherwise try system PHP
if [ -f "/Applications/XAMPP/xamppfiles/bin/php" ]; then
    /Applications/XAMPP/xamppfiles/bin/php -S localhost:8000 router.php
elif command -v php &> /dev/null; then
    php -S localhost:8000 router.php
else
    echo "❌ PHP not found! Please install PHP or use XAMPP."
    exit 1
fi
