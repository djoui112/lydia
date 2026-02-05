# Form Auto-Fill Implementation Documentation

## Overview

This implementation automatically populates forms with user profile data based on the logged-in user type:
- **Architect users** → Auto-fills the "Application Form" with their profile data
- **Client users** → Auto-fills the "Project Request Form" with their profile data

## Implementation Details

### PHP Session Management

The system uses PHP sessions to manage user authentication:
- Session is started via `php/config/session.php`
- User ID and user type are stored in `$_SESSION['user_id']` and `$_SESSION['user_type']`
- Session cookie (`PHPSESSID`) is used to identify logged-in users

### API Endpoint

**Profile API:** `php/api/users/profile.php`

**Method:** GET

**Authentication:** Requires valid PHP session (user must be logged in)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "phone_number": "+213550000000",
      "profile_image": "path/to/image.jpg",
      "user_type": "architect",
      "is_active": 1
    },
    "architect": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-01",
      "address": "123 Main St",
      "primary_expertise": "Modern Interior Design",
      "software_proficiency": "AutoCAD, Revit",
      "portfolio_url": "https://portfolio.com",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "statement": "graduate_architect"
    }
  }
}
```

For clients:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "client@example.com",
      "phone_number": "+213550000001",
      "user_type": "client"
    },
    "client": {
      "first_name": "Jane",
      "last_name": "Smith"
    }
  }
}
```

### JavaScript Auto-Fill Script

**File:** `js/form-autofill.js`

**Features:**
1. Checks if user is logged in (via session cookie)
2. Fetches user profile from API
3. Auto-fills form fields based on user type
4. Only fills empty fields (allows user to override)
5. Works with `form-persistence.js` (waits for it to restore saved data first)
6. Triggers input events for form validation

**Form Field Mappings:**

#### Architect Application Form

**Page 1 (`appliance.html`):**
- `first_name` → `architect.first_name`
- `last_name` → `architect.last_name`
- `phone_number` → `user.phone_number`
- `address` → `architect.address`
- `date_of_birth` → `architect.date_of_birth` (formatted for date input)

**Page 2 (`appliancestyle.html`):**
- `primary_expertise` → `architect.primary_expertise`
- `software_proficiency` → `architect.software_proficiency`
- Statement buttons → `architect.statement` (selects appropriate button)

**Page 3 (`appliancepro.html`):**
- `portfolio_url` → `architect.portfolio_url`
- `linkedin_url` → `architect.linkedin_url`
- `email` → `user.email`

#### Client Project Request Form

**Page 1 (`exteriorproject.html`):**
- `full_name` → `client.first_name + client.last_name`
- `phone_number` → `user.phone_number`
- `email` → `user.email`
- `project_location` → Not auto-filled (user must specify)

### HTML Form Updates

All form inputs now have proper `id` and `name` attributes for JavaScript targeting:

**Architect Forms:**
- `pages/formarchitect/appliance.html` - Added IDs to all inputs
- `pages/formarchitect/appliancestyle.html` - Added IDs to expertise fields
- `pages/formarchitect/appliancepro.html` - Added IDs to portfolio/email fields

**Client Forms:**
- `pages/formclient/exteriorproject.html` - Added IDs to all inputs

All form pages include the auto-fill script:
```html
<script src="../../js/form-autofill.js"></script>
```

### Integration with Form Persistence

The auto-fill script is designed to work seamlessly with `form-persistence.js`:

1. **Form Persistence** runs first and restores any saved form data
2. **Auto-Fill** waits 500ms, then fills remaining empty fields
3. This ensures user's saved progress is preserved, and only empty fields are auto-filled

### User Experience

1. User logs in via login page
2. User navigates to application/project request form
3. Form automatically populates with profile data
4. User can edit any pre-filled values
5. Form validation still works normally
6. User's edits are saved via form-persistence.js

### Security Considerations

1. **Server-Side Validation:** The API endpoint checks for valid session before returning data
2. **User Type Verification:** Auto-fill verifies user type matches form type
3. **No Sensitive Data Exposure:** Only profile data needed for forms is returned
4. **Session-Based Auth:** Uses PHP sessions, not client-side tokens

### Error Handling

- If user is not logged in: Auto-fill silently skips (no error shown)
- If API request fails: Error logged to console, form remains empty
- If user type doesn't match: Auto-fill skipped (prevents wrong data)
- If field doesn't exist: Silently skipped (no errors)

### Testing Checklist

- [ ] Architect logs in → Application form auto-fills
- [ ] Client logs in → Project request form auto-fills
- [ ] User edits auto-filled values → Changes are saved
- [ ] Form validation still works after auto-fill
- [ ] Form persistence works with auto-fill
- [ ] Non-logged-in users see empty forms
- [ ] Wrong user type → Auto-fill skipped

### Files Modified

1. `pages/formarchitect/appliance.html` - Added IDs and script
2. `pages/formarchitect/appliancestyle.html` - Added IDs and script
3. `pages/formarchitect/appliancepro.html` - Added IDs and script
4. `pages/formclient/exteriorproject.html` - Added IDs and script
5. `js/form-autofill.js` - New auto-fill script

### Files Used (No Changes)

1. `php/api/users/profile.php` - Existing API endpoint
2. `php/config/session.php` - Session configuration
3. `js/form-persistence.js` - Form persistence script
4. `js/form-validation.js` - Form validation script

### Future Enhancements

1. Add loading indicator while fetching profile
2. Add success message when form is auto-filled
3. Allow users to toggle auto-fill on/off
4. Cache profile data to reduce API calls
5. Add support for more form pages

---

**Implementation Date:** 2024-12-19
**Status:** ✅ Complete and Ready for Testing
