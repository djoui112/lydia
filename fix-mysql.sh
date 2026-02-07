#!/bin/bash

echo "🔧 Fixing MySQL startup issues..."
echo ""

# Stop any running MySQL processes
echo "1. Stopping any running MySQL processes..."
sudo /Applications/XAMPP/xamppfiles/xampp stopmysql 2>&1
sleep 2

# Kill any remaining MySQL processes
echo "2. Killing any remaining MySQL processes..."
sudo pkill -9 mysqld 2>&1
sudo pkill -9 mysqld_safe 2>&1
sleep 2

# Remove stale lock files
echo "3. Removing stale lock files..."
sudo rm -f /Applications/XAMPP/xamppfiles/var/mysql/*.pid 2>&1
sudo rm -f /Applications/XAMPP/xamppfiles/var/mysql/aria_log_control.lock 2>&1

# Fix permissions
echo "4. Fixing file permissions..."
sudo chown -R _mysql:_mysql /Applications/XAMPP/xamppfiles/var/mysql/ 2>&1

echo ""
echo "5. Starting MySQL..."
sudo /Applications/XAMPP/xamppfiles/xampp startmysql 2>&1

sleep 3

# Check if it's running
echo ""
echo "🔍 Checking MySQL status..."
if lsof -i :3306 > /dev/null 2>&1; then
    echo "✅ MySQL is now running!"
    echo ""
    echo "Testing connection..."
    /Applications/XAMPP/xamppfiles/bin/mysql -u root -e "SELECT 'MySQL is working!' as status;" 2>&1
else
    echo "❌ MySQL still not running. Check the error log:"
    echo "   tail -20 /Applications/XAMPP/xamppfiles/var/mysql/*.err"
fi
