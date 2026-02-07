#!/bin/bash

# Script to create and import mimaria database
echo "🚀 Creating database mimaria..."

# Create database
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS mimaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    echo "📥 Importing SQL file..."
    
    # Import SQL file
    /Applications/XAMPP/xamppfiles/bin/mysql -u root mimaria < "/Users/mac/Desktop/lydia/mimaria (13).sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database imported successfully!"
        echo ""
        echo "Database 'mimaria' is ready to use!"
    else
        echo "❌ Error importing database"
        exit 1
    fi
else
    echo "❌ Error creating database"
    exit 1
fi
