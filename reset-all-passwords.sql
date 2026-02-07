-- Reset all test account passwords to "test123456"
-- This hash is generated with: password_hash('test123456', PASSWORD_BCRYPT)

UPDATE users 
SET password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email IN (
    'agency1@test.com',
    'agency2@test.com', 
    'agency3@test.com',
    'agency4@test.com',
    'agency5@test.com',
    'agency6@test.com',
    'client1@test.com',
    'client2@test.com',
    'client3@test.com',
    'client4@test.com',
    'client5@test.com',
    'client6@test.com',
    'arch1@test.com',
    'arch2@test.com',
    'arch3@test.com',
    'arch4@test.com',
    'arch5@test.com',
    'arch6@test.com',
    'agency@test.com',
    'client@test.com',
    'architect@test.com'
);
