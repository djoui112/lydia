# Attribute Naming Convention Mapping Document

## Standard Naming Convention (Based on login.php)

All attribute names follow **snake_case** convention for:
- Database columns
- JSON request/response fields
- Session variables

PHP variables may use camelCase (e.g., `$agencyId`, `$projectId`) for readability, but all external-facing interfaces (JSON, database, sessions) use snake_case.

---

## Reference: login.php Naming Convention

### Session Variables
- `user_id` - User ID stored in session
- `user_type` - User type: 'client', 'architect', or 'agency'

### Database Columns (users table)
- `id` - Primary key
- `email` - User email
- `password_hash` - Hashed password
- `user_type` - User type enum
- `phone_number` - Phone number
- `profile_image` - Profile image path
- `is_active` - Account active status
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp
- `last_login` - Last login timestamp

### JSON Response Fields
- `user_id` - User ID
- `user_type` - User type
- `email` - User email

### JSON Request Fields
- `email` - User email
- `password` - User password

---

## Unified Naming Convention Applied

### Database Columns (snake_case)
All database columns use snake_case:
- `user_id`, `user_type`, `phone_number`, `profile_image`, `is_active`
- `agency_id`, `architect_id`, `client_id`
- `project_id`, `request_id`, `milestone_id`
- `application_id`, `member_id`
- `assigned_architect_id`
- `first_name`, `last_name`
- `years_of_experience`, `primary_expertise`
- `project_name`, `project_type`, `service_type`
- `min_budget`, `max_budget`
- `start_date`, `end_date`, `due_date`, `due_time`
- `progress_percentage`
- `created_at`, `updated_at`, `reviewed_at`, `completed_at`

### JSON Request/Response Fields (snake_case)
All JSON fields use snake_case to match database:
- `user_id`, `user_type`, `email`, `phone_number`, `profile_image`, `is_active`
- `agency_id`, `architect_id`, `client_id`
- `project_id`, `request_id`, `milestone_id`
- `application_id`, `member_id`
- `assigned_architect_id`
- `first_name`, `last_name`
- `project_name`, `description`, `status`
- `action` (for accept/reject actions)

### Session Variables (snake_case)
- `user_id` - Current user ID
- `user_type` - Current user type

### PHP Variables (camelCase - acceptable)
PHP variables use camelCase for readability:
- `$agencyId`, `$projectId`, `$requestId`
- `$memberId`, `$applicationId`, `$milestoneId`
- `$assignedArchitectId`

---

## Files Verified and Status

### ✅ Files Already Consistent

1. **php/api/auth/login.php**
   - Session: `user_id`, `user_type` ✓
   - Database: `user_type`, `is_active` ✓
   - JSON: `user_id`, `user_type`, `email` ✓

2. **php/agency/profile.php**
   - Database: `phone_number`, `profile_image`, `is_active` ✓
   - JSON input: `phone_number`, `email` ✓
   - JSON output: All fields snake_case ✓

3. **php/agency/applications.php**
   - Database: `architect_id`, `agency_id`, `application_id` ✓
   - JSON input: `application_id`, `action` ✓
   - JSON output: All fields snake_case ✓

4. **php/agency/team-members.php**
   - Database: `member_id`, `agency_id`, `architect_id`, `is_active` ✓
   - JSON input: `member_id`, `is_active` ✓
   - JSON output: All fields snake_case ✓

5. **php/agency/project-requests.php**
   - Database: `request_id`, `client_id`, `agency_id`, `assigned_architect_id` ✓
   - JSON input: `request_id`, `action`, `assigned_architect_id` ✓
   - JSON output: All fields snake_case ✓

6. **php/agency/projects.php**
   - Database: `project_id`, `client_id`, `agency_id`, `assigned_architect_id` ✓
   - JSON input: `project_id`, `assigned_architect_id` ✓
   - JSON output: All fields snake_case ✓

7. **php/agency/milestones.php**
   - Database: `milestone_id`, `project_id` ✓
   - JSON input: `milestone_id`, `project_id` ✓
   - JSON output: All fields snake_case ✓

8. **php/agency/dashboard.php**
   - Database: `agency_id`, `client_id`, `is_active` ✓
   - JSON output: All fields snake_case ✓

9. **php/auth.php**
   - Session: `user_id`, `user_type` ✓

10. **php/upload.php**
    - Database: `profile_image` ✓
    - JSON output: `filepath` ✓

---

## Field Name Mapping (Old → New)

**Note:** All files already use the unified naming convention. No changes needed.

### Common Patterns Verified:
- ✅ All ID fields: `*_id` (e.g., `user_id`, `project_id`, `agency_id`)
- ✅ All date fields: `*_date` or `*_at` (e.g., `start_date`, `created_at`)
- ✅ All boolean fields: `is_*` (e.g., `is_active`, `is_completed`)
- ✅ All number fields: `*_number` or descriptive names (e.g., `phone_number`, `years_of_experience`)
- ✅ All image fields: `*_image` or `*_path` (e.g., `profile_image`, `photo_path`)

---

## Breaking Changes

**None** - All files already follow the unified naming convention from login.php.

---

## Verification Checklist

- [x] Database columns use snake_case
- [x] JSON request fields use snake_case
- [x] JSON response fields use snake_case
- [x] Session variables use snake_case
- [x] All agency PHP files verified
- [x] upload.php verified
- [x] auth.php verified
- [x] No camelCase in JSON or database fields
- [x] Consistent naming across all files

---

## Summary

**Status:** ✅ **All files are already consistent with login.php naming convention**

All agency-related PHP files use the same naming convention as login.php:
- Database columns: snake_case
- JSON fields: snake_case
- Session variables: snake_case
- PHP variables: camelCase (acceptable for internal code)

No changes were required as the codebase already follows the unified naming convention.

---

## Files Checked

1. ✅ php/api/auth/login.php (reference)
2. ✅ php/agency/profile.php
3. ✅ php/agency/applications.php
4. ✅ php/agency/team-members.php
5. ✅ php/agency/project-requests.php
6. ✅ php/agency/projects.php
7. ✅ php/agency/milestones.php
8. ✅ php/agency/dashboard.php
9. ✅ php/auth.php
10. ✅ php/upload.php

---

**Generated:** 2024-12-19
**Verified By:** AI Assistant
**Status:** ✅ Complete - All files verified and consistent

---

## Final Verification Results

### ✅ All Files Verified

**Database Columns:** 100% snake_case
- All SELECT, INSERT, UPDATE queries use snake_case column names
- All foreign keys use `*_id` pattern
- All boolean fields use `is_*` pattern
- All date fields use `*_date` or `*_at` pattern

**JSON Fields:** 100% snake_case
- All `json_encode()` outputs use snake_case
- All `json_decode()` inputs use snake_case
- All request/response fields match database column names

**Session Variables:** 100% snake_case
- `user_id` and `user_type` used consistently

**PHP Variables:** camelCase (acceptable)
- Internal PHP variables use camelCase for readability
- External interfaces (JSON, DB, Session) use snake_case

### Summary Statistics

- **Files Checked:** 10
- **Files Requiring Changes:** 0
- **Inconsistencies Found:** 0
- **Naming Convention Compliance:** 100%

All agency-related PHP files already follow the exact same naming convention as login.php. No changes were required.
