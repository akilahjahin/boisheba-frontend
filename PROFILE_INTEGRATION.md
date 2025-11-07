# Profile & Password Management Integration

This document describes the integration of profile update and password change functionality with the Spring Boot backend.

## Backend Endpoints

### 1. Update Profile
**Endpoint:** `PUT /api/users/profile`  
**Authentication:** Required (Bearer token)  
**Controller Method:** `updateProfile(Authentication, UpdateProfileRequest)`

**Request Body:**
```json
{
  "name": "string (optional)",
  "bio": "string (optional)",
  "profileImageUrl": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "district": "string (optional)",
  "postalCode": "string (optional)",
  "latitude": number (optional),
  "longitude": number (optional)
}
```

**Response:** `UserResponse` object with updated user data

**Notes:**
- All fields are optional
- Only provided fields will be updated
- Phone number cannot be updated via this endpoint
- User ID is extracted from JWT token (Authentication principal)

### 2. Change Password
**Endpoint:** `POST /api/users/change-password`  
**Authentication:** Required (Bearer token)  
**Controller Method:** `changePassword(Authentication, ChangePasswordRequest)`

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response:** `200 OK` with message "Password changed successfully"

**Validation:**
- Current password must match user's existing password
- New password must be at least 6 characters
- User ID is extracted from JWT token

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token
- `400 Bad Request` - Current password is incorrect

## Frontend Implementation

### New Page: Profile.tsx

Located at: `src/pages/Profile.tsx`  
Route: `/profile`

**Features:**
1. **Two Tabs:**
   - Profile Information (with user icon)
   - Change Password (with lock icon)

2. **Profile Information Tab:**
   - Displays current user avatar, name, email, phone
   - Form with sections:
     - Basic Information: Name, Bio, Profile Image URL
     - Location Information: Address, City, District, Postal Code, Latitude, Longitude
   - Auto-populated with current user data
   - Only sends non-empty fields to backend
   - Success/error toast notifications

3. **Change Password Tab:**
   - Current password field
   - New password field (min 6 characters)
   - Confirm password field (must match new password)
   - Client-side validation before submission
   - Form resets after successful password change

### API Functions

**File:** `src/utils/api.ts`

```typescript
// Update user profile
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiFetch<unknown>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  const user = normalizeUser(response);
  updateStoredUser(user); // Updates localStorage
  return user;
}

// Change password
export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return apiFetch<string>("/users/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}
```

### Updated Interfaces

**UpdateProfilePayload:**
```typescript
export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}
```

**ChangePasswordPayload:**
```typescript
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
```

### Navigation

- Profile link added to Header navigation (visible only when logged in)
- Link appears between "Dashboard" and "Admin" (if user is admin)
- Translates to "প্রোফাইল" in Bengali

## Authentication Flow

1. Profile page loads and calls `getCurrentUser()` to fetch latest user data
2. If user is not authenticated, redirects to `/login`
3. All API requests include Bearer token in Authorization header
4. Token is automatically attached by `apiFetch()` helper
5. After profile update, localStorage is updated with new user data
6. Parent components (App.tsx) receive updated user state

## Mock Service Worker (Development)

Mock handlers in `src/mocks/handlers.ts` support:
- `PUT /users/profile` - Updates in-memory user object
- `POST /users/change-password` - Returns success message

## Testing Checklist

### Profile Update
- [ ] Navigate to `/profile` while logged in
- [ ] Verify form is pre-filled with current user data
- [ ] Update name and bio
- [ ] Submit form and verify success toast
- [ ] Refresh page and verify changes persist
- [ ] Update location fields
- [ ] Verify avatar updates when profileImageUrl is changed
- [ ] Test with empty backend URL (mock mode)
- [ ] Test with real backend URL (VITE_API_BASE_URL set)

### Password Change
- [ ] Switch to "Change Password" tab
- [ ] Try submitting with empty fields (should show validation error)
- [ ] Enter incorrect current password (should show error from backend)
- [ ] Enter new password less than 6 characters (should show validation error)
- [ ] Enter non-matching passwords in new/confirm fields (should show error)
- [ ] Successfully change password with valid inputs
- [ ] Verify form resets after success
- [ ] Log out and log in with new password to verify change

### Navigation & UI
- [ ] Profile link appears in header when logged in
- [ ] Profile link hidden when logged out
- [ ] Profile link translates to Bengali when language is switched
- [ ] Mobile menu shows profile link correctly
- [ ] Tab switching works smoothly
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

## Security Considerations

1. **Authentication Required:** Both endpoints require valid JWT token
2. **User ID from Token:** Backend extracts user ID from authentication principal (not from request body)
3. **Password Verification:** Current password must be verified before changing
4. **Password Encoding:** New passwords are BCrypt encoded by backend
5. **HTTPS Required:** In production, all requests should use HTTPS
6. **Token Expiration:** Frontend checks token expiration before API calls

## Error Handling

### Profile Update
- Network errors: Shows "Failed to update profile" toast
- Unauthorized: Should redirect to login (handled by `apiFetch`)
- Validation errors: Displays backend error message in toast

### Password Change
- "Current password is incorrect": Shows error toast with backend message
- Validation errors: Caught client-side before submission
- Network errors: Shows "Failed to change password" toast

## Integration with Backend

### Required Backend Configuration
1. **CORS:** Must allow frontend origin (http://localhost:8082)
2. **JWT Authentication:** JwtAuthenticationFilter must extract user ID from token
3. **Security Config:** Both endpoints require `@PreAuthorize("isAuthenticated()")`

### Backend Dependencies
- Spring Security for authentication
- BCryptPasswordEncoder for password hashing
- JWT utility for token validation
- User repository for data persistence

## API Documentation

OpenAPI specification updated:
- `PUT /users/profile` endpoint documented
- `POST /users/change-password` endpoint documented
- `UpdateProfileRequest` schema matches backend DTO
- `ChangePasswordRequest` schema with validation constraints
- All fields marked as optional in UpdateProfileRequest
- Password minimum length validation documented

## Files Modified/Created

### Created:
- `src/pages/Profile.tsx` - New profile management page

### Modified:
- `src/App.tsx` - Added Profile route and import
- `src/components/Header.tsx` - Added Profile link to navigation
- `src/utils/api.ts` - Updated UpdateProfilePayload interface (removed phone field)
- `openapi.yaml` - Updated UpdateProfileRequest and ChangePasswordRequest schemas

### Existing (No Changes Needed):
- `src/mocks/handlers.ts` - Mock endpoints already implemented
- `src/utils/api.ts` - API functions already implemented

## Next Steps

1. Ensure Spring Boot backend is running on port 8081
2. Verify CORS configuration allows http://localhost:8082
3. Test profile update with real backend
4. Test password change with real backend
5. Verify JWT token extraction works correctly
6. Test error scenarios (wrong password, expired token, etc.)
