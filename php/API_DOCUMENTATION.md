# Agency Backend API Documentation

## Base URL
All endpoints are relative to: `/php/agency/` or `/php/`

## Authentication
All endpoints require authentication via session. The user must be logged in as an agency type user.

---

## 1. Agency Profile Management

### Get Agency Profile
**GET** `/php/agency/profile.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Agency Name",
    "city": "Algiers",
    "address": "123 Main St",
    "bio": "Agency description",
    "email": "agency@example.com",
    "phone_number": "+213550000000",
    "profile_image": "uploads/agencies/1/profile.jpg",
    "cover_image": "uploads/agencies/1/cover.jpg",
    "is_active": true
  }
}
```

### Update Agency Profile
**PUT** `/php/agency/profile.php`

**Request Body:**
```json
{
  "name": "Updated Agency Name",
  "city": "Oran",
  "address": "456 New St",
  "bio": "Updated bio",
  "email": "newemail@example.com",
  "phone_number": "+213550000001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 2. File Upload

### Upload File
**POST** `/php/upload.php`

**Form Data:**
- `file`: File to upload (image or PDF)
- `type`: Upload type - `profile`, `cover`, or `document`

**Response:**
```json
{
  "success": true,
  "filepath": "uploads/agencies/1/filename.jpg",
  "message": "File uploaded successfully"
}
```

---

## 3. Team Management - Applications

### Get Applications
**GET** `/php/agency/applications.php`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `accepted`, `rejected`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "architect_id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "years_of_experience": 5,
      "primary_expertise": "Residential",
      "status": "pending",
      "created_at": "2024-01-15 10:00:00"
    }
  ]
}
```

### Accept/Reject Application
**PUT** `/php/agency/applications.php`

**Request Body:**
```json
{
  "application_id": 1,
  "action": "accept"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application accepted successfully"
}
```

---

## 4. Team Management - Members

### Get Team Members
**GET** `/php/agency/team-members.php`

**Query Parameters:**
- `active_only` (optional, default: true): Filter active members only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "architect_id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "Senior Architect",
      "salary": 50000,
      "start_date": "2024-01-01",
      "is_active": true
    }
  ]
}
```

### Update Team Member
**PUT** `/php/agency/team-members.php`

**Request Body:**
```json
{
  "member_id": 1,
  "role": "Lead Architect",
  "salary": 60000,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team member updated successfully"
}
```

### Remove Team Member
**DELETE** `/php/agency/team-members.php?member_id=1`

**Response:**
```json
{
  "success": true,
  "message": "Team member removed successfully"
}
```

---

## 5. Project Requests Management

### Get Project Requests
**GET** `/php/agency/project-requests.php`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `accepted`, `rejected`)
- `request_id` (optional): Get single request with full details

**Response (List):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 3,
      "project_name": "Villa Design",
      "project_type": "both",
      "status": "pending",
      "first_name": "Jane",
      "last_name": "Smith",
      "client_email": "jane@example.com",
      "created_at": "2024-01-15 10:00:00"
    }
  ]
}
```

**Response (Single with details):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_name": "Villa Design",
    "interior_details": { ... },
    "exterior_details": { ... },
    "photos": [ ... ]
  }
}
```

### Accept/Reject Project Request
**PUT** `/php/agency/project-requests.php`

**Request Body:**
```json
{
  "request_id": 1,
  "action": "accept",
  "assigned_architect_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request accepted and project created",
  "project_id": 10
}
```

---

## 6. Project Management

### Get Projects
**GET** `/php/agency/projects.php`

**Query Parameters:**
- `project_id` (optional): Get single project with details
- `status` (optional): Filter by status

**Response (List):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_name": "Villa Design",
      "status": "in_progress",
      "progress_percentage": 45,
      "first_name": "Jane",
      "last_name": "Smith"
    }
  ]
}
```

**Response (Single with details):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_name": "Villa Design",
    "description": "Modern villa design",
    "status": "in_progress",
    "progress_percentage": 45,
    "milestones": [ ... ],
    "photos": [ ... ]
  }
}
```

### Update Project
**PUT** `/php/agency/projects.php`

**Request Body:**
```json
{
  "project_id": 1,
  "project_name": "Updated Project Name",
  "description": "Updated description",
  "status": "in_progress",
  "progress_percentage": 50,
  "deadline": "2024-12-31",
  "assigned_architect_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully"
}
```

---

## 7. Milestone Management

### Get Milestones
**GET** `/php/agency/milestones.php?project_id=1`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Design Phase Complete",
      "description": "Complete initial design",
      "due_date": "2024-02-15",
      "due_time": "17:00:00",
      "is_completed": false
    }
  ]
}
```

### Create Milestone
**POST** `/php/agency/milestones.php`

**Request Body:**
```json
{
  "project_id": 1,
  "title": "Design Phase Complete",
  "description": "Complete initial design",
  "due_date": "2024-02-15",
  "due_time": "17:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Milestone created successfully",
  "milestone_id": 5
}
```

### Update Milestone
**PUT** `/php/agency/milestones.php`

**Request Body:**
```json
{
  "milestone_id": 1,
  "title": "Updated Title",
  "due_date": "2024-02-20",
  "is_completed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Milestone updated successfully"
}
```

### Delete Milestone
**DELETE** `/php/agency/milestones.php?milestone_id=1`

**Response:**
```json
{
  "success": true,
  "message": "Milestone deleted successfully"
}
```

---

## 8. Dashboard Statistics

### Get Dashboard Stats
**GET** `/php/agency/dashboard.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_clients": 25,
    "total_architects": 8,
    "total_projects": 15,
    "pending_requests": 5,
    "upcoming_deadlines": 3
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (not logged in or wrong user type)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Notes

1. **Database Configuration**: Update `php/config.php` with your database credentials
2. **File Uploads**: Files are stored in `uploads/agencies/{agency_id}/`
3. **Session Management**: Ensure sessions are properly configured in PHP
4. **CORS**: CORS headers are set for development. Adjust for production
5. **Security**: All inputs should be validated and sanitized before use
