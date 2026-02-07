#!/bin/bash

echo "🔐 Creating test accounts..."
echo ""

# Import the SQL file
/Applications/XAMPP/xamppfiles/bin/mysql -u root mimaria < "/Users/mac/Desktop/lydia/create-test-accounts.sql" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test accounts created successfully!"
    echo ""
    echo "📋 Account Details:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1️⃣  AGENCY ACCOUNT:"
    echo "   Email: agency@test.com"
    echo "   Password: test123456"
    echo ""
    echo "2️⃣  CLIENT ACCOUNT:"
    echo "   Email: client@test.com"
    echo "   Password: test123456"
    echo ""
    echo "3️⃣  ARCHITECT ACCOUNT:"
    echo "   Email: architect@test.com"
    echo "   Password: test123456"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "You can now log in at: http://localhost:8000/pages/login/login.html"
else
    echo "❌ Error creating accounts. Check the SQL file and try again."
    exit 1
fi
