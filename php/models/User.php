<?php

class User
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => (int)$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function create($data)
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (email, password_hash, user_type, phone_number, profile_image, is_active, created_at, updated_at)
             VALUES (:email, :password_hash, :user_type, :phone_number, :profile_image, 1, NOW(), NOW())'
        );

        $stmt->execute([
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'user_type' => $data['user_type'],
            'phone_number' => $data['phone_number'] ?? null,
            'profile_image' => $data['profile_image'] ?? null,
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function updateLastLogin($id)
    {
        $stmt = $this->db->prepare('UPDATE users SET last_login = NOW() WHERE id = :id');
        $stmt->execute(['id' => (int)$id]);
    }

    public function changePassword($id, $passwordHash)
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute([
            'password_hash' => $passwordHash,
            'id' => (int)$id,
        ]);
    }
}