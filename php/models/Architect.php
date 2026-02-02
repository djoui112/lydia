<?php

class Architect
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

   public function create($userId, $data)
{
    $stmt = $this->db->prepare(
        'INSERT INTO architects (
            id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            city,
            address,
            bio,
            years_of_experience,
            portfolio_url,
            linkedin_url,
            primary_expertise
        ) VALUES (
            :id,
            :first_name,
            :last_name,
            :date_of_birth,
            :gender,
            :city,
            :address,
            :bio,
            :years_of_experience,
            :portfolio_url,
            :linkedin_url,
            :primary_expertise
        )'
    );

    $stmt->execute([
        'id' => (int) $userId,
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'date_of_birth' => $data['date_of_birth'] ?? null,
        'gender' => $data['gender'] ?? null,
        'city' => $data['city'] ?? null,
        'address' => $data['address'] ?? null,
        'bio' => $data['bio'] ?? null,
        'years_of_experience' => $data['years_of_experience'] ?? null,
        'portfolio_url' => $data['portfolio_url'] ?? null,
        'linkedin_url' => $data['linkedin_url'] ?? null,
        'primary_expertise' => $data['primary_expertise'] ?? null
    ]);

    return (int) $userId;
}


    public function findByUserId($userId)
    {
        $stmt = $this->db->prepare(
            'SELECT a.*, u.email, u.phone_number, u.profile_image
             FROM architects a
             JOIN users u ON a.id = u.id
             WHERE a.id = :id'
        );
        $stmt->execute(['id' => (int)$userId]);
        $architect = $stmt->fetch(PDO::FETCH_ASSOC);
        return $architect ?: null;
    }

    public function update($userId, $data)
    {
        $stmt = $this->db->prepare(
            'UPDATE architects SET
                first_name = :first_name,
                last_name = :last_name,
                date_of_birth = :date_of_birth,
                gender = :gender,
                city = :city,
                address = :address,
                bio = :bio,
                years_of_experience = :years_of_experience,
                portfolio_url = :portfolio_url,
                linkedin_url = :linkedin_url,
                primary_expertise = :primary_expertise
             WHERE id = :id'
        );

        $stmt->execute([
            'id' => (int)$userId,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'bio' => $data['bio'] ?? null,
            'years_of_experience' => $data['years_of_experience'] ?? null,
            'portfolio_url' => $data['portfolio_url'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'primary_expertise' => $data['primary_expertise'] ?? null
        ]);
    }
}