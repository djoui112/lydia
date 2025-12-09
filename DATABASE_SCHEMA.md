# Mimaria Database Schema

## Overview
This document outlines all database tables needed for the Mimaria platform, which connects architects, architecture agencies, and clients.

---

## Core User Tables

### 1. `users`
Base user table for authentication and common user data.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `email` (UNIQUE, NOT NULL)
- `password_hash` (NOT NULL)
- `user_type` (ENUM: 'client', 'architect', 'agency')
- `phone_number` (VARCHAR(20), NULLABLE)
- `profile_image` (VARCHAR(255), NULLABLE)
- `is_active` (BOOLEAN, DEFAULT TRUE) - Account status (FALSE if account is suspended/deactivated)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_login` (TIMESTAMP, NULLABLE)

### 2. `clients`
Client-specific information.
- `id` (PRIMARY KEY, FOREIGN KEY -> users.id)
- `first_name` (VARCHAR(100), NOT NULL)
- `last_name` (VARCHAR(100), NOT NULL)

### 3. `architects`
Architect-specific information.
- `id` (PRIMARY KEY, FOREIGN KEY -> users.id)
- `first_name` (VARCHAR(100), NOT NULL)
- `last_name` (VARCHAR(100), NOT NULL)
- `date_of_birth` (DATE)
- `gender` (ENUM: 'male', 'female')
- `city` (VARCHAR(100))
- `address` (TEXT)
- `bio` (TEXT, NULLABLE)
- `years_of_experience` (INT, NULLABLE)
- `portfolio_url` (VARCHAR(255), NULLABLE)
- `linkedin_url` (VARCHAR(255), NULLABLE)
- `primary_expertise` (VARCHAR(255), NULLABLE)
- `software_proficiency` (TEXT, NULLABLE)
- `statement` (ENUM: 'graduate_architect', 'intern')

### 4. `agencies`
Agency-specific information.
- `id` (PRIMARY KEY, FOREIGN KEY -> users.id)
- `name` (VARCHAR(255), NOT NULL)
- `city` (VARCHAR(100))
- `address` (TEXT)
- `cover_image` (VARCHAR(255), NULLABLE)
- `bio` (TEXT, NULLABLE)
- `legal_document` (VARCHAR(255), NULLABLE) - Path to uploaded legal document
- `is_approved` (BOOLEAN, DEFAULT FALSE) - Agency approval status

---

## Project Management Tables

### 5. `project_requests`
Client project requests submitted to agencies.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `client_id` (FOREIGN KEY -> clients.id, NOT NULL)
- `agency_id` (FOREIGN KEY -> agencies.id, NOT NULL)
- `project_name` (VARCHAR(255), NOT NULL)
- `project_type` (ENUM: 'exterior', 'interior', 'both')
- `service_type` (ENUM: 'construction', 'renovation', 'design_only')
- `project_location` (VARCHAR(255))
- `status` (ENUM: 'pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')
- `min_budget` (DECIMAL(15,2), NULLABLE)
- `max_budget` (DECIMAL(15,2), NULLABLE)
- `preferred_timeline` (VARCHAR(100), NULLABLE)
- `style_preference` (VARCHAR(255), NULLABLE)
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** Client contact information (full_name, phone_number, email) is retrieved from `clients` and `users` tables via `client_id`, avoiding data duplication.

### 6. `project_request_interior_details`
Interior-specific details for project requests.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `request_id` (FOREIGN KEY -> project_requests.id, NOT NULL)
- `interior_location` (VARCHAR(255), NULLABLE)
- `property_type` (ENUM: 'apartment', 'house', 'office', 'commercial', 'other')
- `number_of_rooms` (INT, NULLABLE)
- `area` (DECIMAL(10,2), NULLABLE) - in m²
- `style_preference` (VARCHAR(255), NULLABLE)
- `color_scheme` (VARCHAR(255), NULLABLE)
- `material_preferences` (TEXT, NULLABLE) - JSON or comma-separated
- `special_requirements` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

### 7. `project_request_exterior_details`
Exterior-specific details for project requests.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `request_id` (FOREIGN KEY -> project_requests.id, NOT NULL)
- `property_type` (ENUM: 'residential', 'commercial', 'landscape', 'institutional', 'other')
- `number_of_floors` (INT, NULLABLE)
- `area` (DECIMAL(10,2), NULLABLE) - in m²
- `style_preference` (VARCHAR(255), NULLABLE)
- `material_preferences` (TEXT, NULLABLE) - JSON or comma-separated (concrete, stone, wood, metal, glass)
- `special_requirements` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)

### 8. `project_request_photos`
Photos uploaded with project requests.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `request_id` (FOREIGN KEY -> project_requests.id, NOT NULL)
- `photo_path` (VARCHAR(255), NOT NULL)
- `photo_type` (ENUM: 'reference', 'current_state', 'other')
- `uploaded_at` (TIMESTAMP)

### 9. `projects`
Actual projects created from accepted requests.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `request_id` (FOREIGN KEY -> project_requests.id, NOT NULL)
- `client_id` (FOREIGN KEY -> clients.id, NOT NULL)
- `agency_id` (FOREIGN KEY -> agencies.id, NOT NULL)
- `assigned_architect_id` (FOREIGN KEY -> architects.id, NULLABLE)
- `project_name` (VARCHAR(255), NOT NULL)
- `description` (TEXT, NULLABLE)
- `status` (ENUM: 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')
- `progress_percentage` (INT, DEFAULT 0) - 0-100
- `start_date` (DATE, NULLABLE)
- `deadline` (DATE, NULLABLE)
- `completed_date` (DATE, NULLABLE)
- `budget` (DECIMAL(15,2), NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 10. `project_milestones`
Project milestones and deadlines.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `project_id` (FOREIGN KEY -> projects.id, NOT NULL)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT, NULLABLE)
- `due_date` (DATE, NOT NULL)
- `due_time` (TIME, NULLABLE)
- `is_completed` (BOOLEAN, DEFAULT FALSE)
- `completed_at` (TIMESTAMP, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 11. `project_photos`
Photos associated with projects (portfolio items).
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `project_id` (FOREIGN KEY -> projects.id, NOT NULL)
- `photo_path` (VARCHAR(255), NOT NULL)
- `is_primary` (BOOLEAN, DEFAULT FALSE)
- `display_order` (INT, DEFAULT 0)
- `uploaded_at` (TIMESTAMP)

---

## Portfolio Tables

### 12. `architect_portfolio_items`
Portfolio projects showcased by architects.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `architect_id` (FOREIGN KEY -> architects.id, NOT NULL)
- `project_id` (FOREIGN KEY -> projects.id, NULLABLE) - Links to actual project if exists
- `project_name` (VARCHAR(255), NOT NULL) - Custom display name (may differ from project name)
- `description` (TEXT, NULLABLE) - Custom description for portfolio display
- `project_type` (ENUM: 'residential', 'commercial', 'institutional', 'urban', 'cultural', 'interior', 'exterior')
- `style_tags` (TEXT, NULLABLE) - JSON or comma-separated (modern, traditional, minimalist, etc.)
- `completion_date` (DATE, NULLABLE)
- `is_featured` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** If `project_id` is set, some fields (project_name, description, completion_date) could be retrieved from `projects` table, but portfolio items may have custom display names/descriptions for portfolio purposes. Standalone portfolio items (project_id is NULL) require all fields.

### 13. `architect_portfolio_photos`
Photos for architect portfolio items.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `portfolio_item_id` (FOREIGN KEY -> architect_portfolio_items.id, NOT NULL)
- `photo_path` (VARCHAR(255), NOT NULL)
- `is_primary` (BOOLEAN, DEFAULT FALSE)
- `display_order` (INT, DEFAULT 0)
- `uploaded_at` (TIMESTAMP)

### 14. `agency_portfolio_items`
Portfolio projects showcased by agencies.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `agency_id` (FOREIGN KEY -> agencies.id, NOT NULL)
- `project_id` (FOREIGN KEY -> projects.id, NULLABLE) - Links to actual project if exists
- `project_name` (VARCHAR(255), NOT NULL) - Custom display name (may differ from project name)
- `description` (TEXT, NULLABLE) - Custom description for portfolio display
- `project_type` (ENUM: 'residential', 'commercial', 'institutional', 'urban', 'cultural', 'interior', 'exterior')
- `style_tags` (TEXT, NULLABLE) - JSON or comma-separated
- `completion_date` (DATE, NULLABLE)
- `is_featured` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** If `project_id` is set, some fields (project_name, description, completion_date) could be retrieved from `projects` table, but portfolio items may have custom display names/descriptions for portfolio purposes. Standalone portfolio items (project_id is NULL) require all fields.

### 15. `agency_portfolio_photos`
Photos for agency portfolio items.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `portfolio_item_id` (FOREIGN KEY -> agency_portfolio_items.id, NOT NULL)
- `photo_path` (VARCHAR(255), NOT NULL)
- `is_primary` (BOOLEAN, DEFAULT FALSE)
- `display_order` (INT, DEFAULT 0)
- `uploaded_at` (TIMESTAMP)

### 16. `architect_education`
Education history for architects.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `architect_id` (FOREIGN KEY -> architects.id, NOT NULL)
- `university_name` (VARCHAR(255), NOT NULL)
- `degree` (VARCHAR(255), NOT NULL) - e.g., "Bachelor of Architecture", "Master of Architecture"
- `field_of_study` (VARCHAR(255), NULLABLE) - e.g., "Architecture", "Urban Planning"
- `start_date` (DATE, NULLABLE)
- `end_date` (DATE, NULLABLE) - NULL if still studying
- `is_current` (BOOLEAN, DEFAULT FALSE)
- `display_order` (INT, DEFAULT 0) - For ordering multiple entries
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 17. `architect_experience`
Work experience history for architects.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `architect_id` (FOREIGN KEY -> architects.id, NOT NULL)
- `role` (VARCHAR(255), NOT NULL) - e.g., "Senior Architect", "Junior Architect", "Project Manager"
- `agency_id` (FOREIGN KEY -> agencies.id, NULLABLE) - Link to agency if exists in system
- `agency_name` (VARCHAR(255), NULLABLE) - Name of the agency/company (required only if agency_id is NULL)
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE, NULLABLE) - NULL if current position
- `is_current` (BOOLEAN, DEFAULT FALSE) - TRUE if "Present"
- `description` (TEXT, NULLABLE) - Job description and responsibilities
- `display_order` (INT, DEFAULT 0) - For ordering multiple entries
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** If `agency_id` is set, `agency_name` can be retrieved from `agencies` table. `agency_name` is only needed when the agency is not in the system (agency_id is NULL).

---

## Agency-Architect Relationship Tables

### 18. `architect_applications`
Job applications from architects to agencies.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `architect_id` (FOREIGN KEY -> architects.id, NOT NULL)
- `agency_id` (FOREIGN KEY -> agencies.id, NOT NULL)
- `project_types` (TEXT, NULLABLE) - JSON or comma-separated (residential, commercial, institutional, urban, cultural) - Application-specific project types
- `motivation_letter` (TEXT, NOT NULL) - Application-specific motivation letter
- `status` (ENUM: 'pending', 'accepted', 'rejected', 'withdrawn')
- `reviewed_at` (TIMESTAMP, NULLABLE)
- `reviewed_by` (FOREIGN KEY -> agencies.id, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** Professional information (statement, primary_expertise, software_proficiency, portfolio_url, linkedin_url, email) is retrieved from the architect's profile (`architects` table) and `users` table, avoiding data duplication.

### 19. `agency_team_members`
Architects working for agencies (accepted applications).
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `agency_id` (FOREIGN KEY -> agencies.id, NOT NULL)
- `architect_id` (FOREIGN KEY -> architects.id, NOT NULL)
- `application_id` (FOREIGN KEY -> architect_applications.id, NULLABLE)
- `role` (VARCHAR(100), NULLABLE) - e.g., "Senior Architect", "Junior Architect"
- `salary` (DECIMAL(10,2), NULLABLE)
- `start_date` (DATE)
- `end_date` (DATE, NULLABLE) - NULL if still active
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE KEY `unique_agency_architect` (`agency_id`, `architect_id`)

---

## Review and Rating Tables

### 20. `reviews`
Reviews and ratings from clients.
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `client_id` (FOREIGN KEY -> clients.id, NOT NULL)
- `project_id` (FOREIGN KEY -> projects.id, NULLABLE) - Review for specific project
- `agency_id` (FOREIGN KEY -> agencies.id, NULLABLE) - Review for agency
- `architect_id` (FOREIGN KEY -> architects.id, NULLABLE) - Review for architect
- `rating` (INT, NOT NULL) - 1-5 stars
- `review_text` (TEXT, NOT NULL)
- `is_verified` (BOOLEAN, DEFAULT FALSE) - Verified purchase/project
- `is_visible` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- CHECK constraint: At least one of project_id, agency_id, or architect_id must be NOT NULL

**Note:** Reviewer name is retrieved from `clients` table (first_name + last_name) via `client_id`, avoiding data duplication.

---

## Summary

**Total Tables: 20**

### Core Tables (4):
1. users
2. clients
3. architects
4. agencies

### Project Management Tables (7):
5. project_requests
6. project_request_interior_details
7. project_request_exterior_details
8. project_request_photos
9. projects
10. project_milestones
11. project_photos

### Portfolio Tables (6):
12. architect_portfolio_items
13. architect_portfolio_photos
14. agency_portfolio_items
15. agency_portfolio_photos
16. architect_education
17. architect_experience

### Relationship Tables (2):
18. architect_applications
19. agency_team_members

### Review Tables (1):
20. reviews

---

## Key Relationships

- **Users → Clients/Architects/Agencies**: One-to-one relationship
- **Clients → Project Requests**: One-to-many
- **Agencies → Project Requests**: One-to-many
- **Project Requests → Projects**: One-to-one (when accepted)
- **Agencies → Architects**: Many-to-many through `agency_team_members`
- **Architects → Agencies**: Many-to-many through `architect_applications` and `agency_team_members`
- **Projects → Milestones**: One-to-many
- **Projects → Reviews**: One-to-many
- **Agencies → Reviews**: One-to-many
- **Architects → Reviews**: One-to-many
- **Architects → Education**: One-to-many
- **Architects → Experience**: One-to-many

---

## Indexes Recommended

- `users.email` (UNIQUE INDEX)
- `project_requests.client_id` (INDEX)
- `project_requests.agency_id` (INDEX)
- `project_requests.status` (INDEX)
- `projects.client_id` (INDEX)
- `projects.agency_id` (INDEX)
- `projects.assigned_architect_id` (INDEX)
- `projects.status` (INDEX)
- `architect_education.architect_id` (INDEX)
- `architect_experience.architect_id` (INDEX)
- `architect_experience.agency_id` (INDEX)
- `architect_applications.architect_id` (INDEX)
- `architect_applications.agency_id` (INDEX)
- `architect_applications.status` (INDEX)
- `agency_team_members.agency_id` (INDEX)
- `agency_team_members.architect_id` (INDEX)
- `reviews.client_id` (INDEX)
- `reviews.project_id` (INDEX)
- `reviews.agency_id` (INDEX)
- `reviews.architect_id` (INDEX)

---

## Notes

1. **File Storage**: Photo paths should be stored as relative paths or URLs. Consider using a file storage service (AWS S3, Cloudinary, etc.) for production.

2. **JSON Fields**: Some fields like `material_preferences` and `project_types` can be stored as JSON for flexibility, or as separate junction tables for better normalization.

3. **Soft Deletes**: Consider adding `deleted_at` (TIMESTAMP, NULLABLE) columns to main tables for soft delete functionality.

4. **Audit Trail**: Consider adding `created_by` and `updated_by` foreign keys to track who created/updated records.

5. **Search Optimization**: For full-text search on project names, descriptions, etc., consider using FULLTEXT indexes or implementing a search service like Elasticsearch.

6. **Security**: Ensure proper indexing on foreign keys and implement row-level security policies if using PostgreSQL.

