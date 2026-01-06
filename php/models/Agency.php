<?php

class Agency
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function create($userId, $data)
    {
        $stmt = $this->db->prepare(
            'INSERT INTO agencies (
                id, name, city, address, cover_image, bio, legal_document, is_approved
            ) VALUES (
                :id, :name, :city, :address, :cover_image, :bio, :legal_document, 0
            )'
        );

        $stmt->execute([
            'id' => (int)$userId,
            'name' => $data['name'],
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'cover_image' => $data['cover_image'] ?? null,
            'bio' => $data['bio'] ?? null,
            'legal_document' => $data['legal_document'] ?? null,
        ]);

        return (int)$userId;
    }

    public function findByUserId($userId)
    {
        $stmt = $this->db->prepare(
            'SELECT ag.*, u.email, u.phone_number, u.profile_image
             FROM agencies ag
             JOIN users u ON ag.id = u.id
             WHERE ag.id = :id'
        );
        $stmt->execute(['id' => (int)$userId]);
        $agency = $stmt->fetch(PDO::FETCH_ASSOC);
        return $agency ?: null;
    }

    public function update($userId, $data)
    {
        $stmt = $this->db->prepare(
            'UPDATE agencies SET
                name = :name,
                city = :city,
                address = :address,
                bio = :bio
             WHERE id = :id'
        );

        $stmt->execute([
            'id' => (int)$userId,
            'name' => $data['name'],
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'bio' => $data['bio'] ?? null,
        ]);
    }
}