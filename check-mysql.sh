#!/bin/bash

echo "🔍 Checking MySQL Status..."
echo ""

# Check if MySQL process is running
if pgrep -f "mysqld" > /dev/null; then
    echo "✅ MySQL process is running"
else
    echo "❌ MySQL process is NOT running"
fi

# Check if port 3306 is listening
if lsof -i :3306 > /dev/null 2>&1; then
    echo "✅ Port 3306 is listening"
else
    echo "❌ Port 3306 is NOT listening"
fi

# Check MySQL socket
if [ -S "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock" ]; then
    echo "✅ MySQL socket exists"
else
    echo "❌ MySQL socket does NOT exist"
fi

# Try to connect
echo ""
echo "🔌 Testing connection..."
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "SELECT 1;" 2>&1

echo ""
echo "📋 To start MySQL, run:"
echo "   sudo /Applications/XAMPP/xamppfiles/xampp startmysql"
echo ""
echo "   Or use XAMPP Control Panel and click 'Start' next to MySQL Database"
