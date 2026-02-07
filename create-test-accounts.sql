-- Create test accounts for Agency, Client, and Architect
-- Password for all accounts: test123456 (hashed with bcrypt)

-- 1. Agency Account
INSERT INTO users (id, email, password_hash, user_type, phone_number, profile_image, is_active, created_at, updated_at) 
VALUES (100, 'agency@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0555000100', NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO agencies (id, name, city, address, cover_image, bio, legal_document, is_approved) 
VALUES (100, 'Test Agency', 'Algiers', 'Test Address', NULL, 'Test agency account', NULL, 1)
ON DUPLICATE KEY UPDATE name=name;

-- 2. Client Account
INSERT INTO users (id, email, password_hash, user_type, phone_number, profile_image, is_active, created_at, updated_at) 
VALUES (101, 'client@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000101', NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO clients (id, first_name, last_name) 
VALUES (101, 'Test', 'Client')
ON DUPLICATE KEY UPDATE first_name=first_name;

-- 3. Architect Account
INSERT INTO users (id, email, password_hash, user_type, phone_number, profile_image, is_active, created_at, updated_at) 
VALUES (102, 'architect@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0555000102', NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO architects (id, first_name, last_name, date_of_birth, gender, city, address, bio, years_of_experience, statement) 
VALUES (102, 'Test', 'Architect', NULL, NULL, 'Algiers', NULL, 'Test architect account', 5, 'graduate architect')
ON DUPLICATE KEY UPDATE first_name=first_name;

-- Display created accounts
SELECT id, email, user_type, phone_number, is_active FROM users WHERE id IN (100, 101, 102);
