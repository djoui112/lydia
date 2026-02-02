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
        // Build dynamic UPDATE query based on provided fields
        $fields = [];
        $params = ['id' => (int)$userId];
        
        if (isset($data['first_name'])) {
            $fields[] = 'first_name = :first_name';
            $params['first_name'] = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $fields[] = 'last_name = :last_name';
            $params['last_name'] = $data['last_name'];
        }
        if (isset($data['date_of_birth'])) {
            $fields[] = 'date_of_birth = :date_of_birth';
            $params['date_of_birth'] = $data['date_of_birth'] ?: null;
        }
        if (isset($data['gender'])) {
            $fields[] = 'gender = :gender';
            $params['gender'] = $data['gender'] ?: null;
        }
        if (isset($data['city'])) {
            $fields[] = 'city = :city';
            $params['city'] = $data['city'] ?: null;
        }
        if (isset($data['address'])) {
            $fields[] = 'address = :address';
            $params['address'] = $data['address'] ?: null;
        }
        if (isset($data['bio'])) {
            $fields[] = 'bio = :bio';
            $params['bio'] = $data['bio'] ?: null;
        }
        if (isset($data['years_of_experience'])) {
            $fields[] = 'years_of_experience = :years_of_experience';
            $params['years_of_experience'] = $data['years_of_experience'] !== null ? (int)$data['years_of_experience'] : null;
        }
        if (isset($data['portfolio_url'])) {
            $fields[] = 'portfolio_url = :portfolio_url';
            $params['portfolio_url'] = $data['portfolio_url'] ?: null;
        }
        if (isset($data['linkedin_url'])) {
            $fields[] = 'linkedin_url = :linkedin_url';
            $params['linkedin_url'] = $data['linkedin_url'] ?: null;
        }
        if (isset($data['primary_expertise'])) {
            $fields[] = 'primary_expertise = :primary_expertise';
            $params['primary_expertise'] = $data['primary_expertise'] ?: null;
        }
        if (isset($data['statement'])) {
            $fields[] = 'statement = :statement';
            $params['statement'] = $data['statement'] ?: null;
        }
        if (isset($data['software_proficiency'])) {
            $fields[] = 'software_proficiency = :software_proficiency';
            $params['software_proficiency'] = $data['software_proficiency'] ?: null;
        }
        if (isset($data['projects_worked_on'])) {
            $fields[] = 'projects_worked_on = :projects_worked_on';
            $params['projects_worked_on'] = $data['projects_worked_on'] ?: null;
        }
        
        if (empty($fields)) {
            return; // No fields to update
        }
        
        $sql = 'UPDATE architects SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
    }
}