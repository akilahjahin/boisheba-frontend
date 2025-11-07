# Backend Integration Guide

## Overview

The frontend is now fully integrated with the Spring Boot User Service backend. The integration includes proper type mappings, authentication flows, and session management.

## Changes Made

### 1. Updated Type Definitions (`src/utils/api.ts`)

#### User Interface

Extended the `User` interface to match the backend `UserResponse` DTO:

- Added all backend fields: `profileImageUrl`, `bio`, `address`, `city`, `district`, `postalCode`, `latitude`, `longitude`
- Added statistics fields: `totalBooksListed`, `totalBooksBorrowed`, `totalBooksLent`, `completedTransactions`, etc.
- Added verification fields: `emailVerified`, `phoneVerified`
- Added timestamps: `lastLoginAt`, `createdAt`

#### RegisterPayload Interface

Updated to match the backend `RegisterRequest` DTO:

```typescript
export interface RegisterPayload {
  name: string; // Required: 2-100 characters
  email: string; // Required: Valid email
  phone: string; // Required: Bangladesh phone format
  password: string; // Required: Min 6 characters
  address?: string; // Optional
  city?: string; // Optional
  district?: string; // Optional
  postalCode?: string; // Optional
  latitude?: number; // Optional
  longitude?: number; // Optional
}
```

#### AuthResponse Interface

Extended to include:

- `tokenType`: "Bearer"
- `expiresIn`: Token expiration time in milliseconds (86400000 = 24 hours)

### 2. Updated Authentication Flow

#### Token Management

- Token type is now stored and used in Authorization headers
- Token expiration is tracked and enforced
- Expired sessions are automatically cleared
- Authorization header format: `Bearer <token>` (or custom token type from backend)

#### Session Storage

New localStorage keys:

- `boisheba.auth.accessToken`: JWT token
- `boisheba.auth.tokenType`: Token type (e.g., "Bearer")
- `boisheba.auth.tokenExpiry`: Expiration timestamp
- `boisheba.auth.refreshToken`: Refresh token (if provided)
- `boisheba.auth.user`: User profile data

### 3. Updated Signup Page (`src/pages/Signup.tsx`)

#### Required Fields

- Full Name (2-100 characters)
- Email (valid email format)
- Phone Number (Bangladesh format: `01[3-9]XXXXXXXX`)
- Password (minimum 6 characters)
- Confirm Password

#### Optional Fields

- Address
- City
- District
- Postal Code

#### Layout

- Two-column grid for better UX on desktop
- Responsive design with proper mobile support
- Required fields marked with red asterisk (\*)
- Optional fields grouped in separate section

### 4. Updated Mock Service Worker (`src/mocks/handlers.ts`)

Mock responses now match the real backend structure:

```json
{
  "token": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "phone": "+8801712345678",
    "profileImageUrl": null,
    "bio": null,
    "address": "House 10, Road 5, Dhanmondi",
    "city": "Dhaka",
    "district": "Dhaka",
    "postalCode": "1209",
    "latitude": 23.746466,
    "longitude": 90.376015,
    "trustScore": 50.0,
    "totalBooksListed": 0,
    "totalBooksBorrowed": 0,
    "totalBooksLent": 0,
    "completedTransactions": 0,
    "averageRating": 0.0,
    "totalRatings": 0,
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": false,
    "phoneVerified": false,
    "lastLoginAt": null,
    "createdAt": "2025-11-08T01:21:43.608109"
  }
}
```

### 5. Updated OpenAPI Specification (`openapi.yaml`)

Updated schemas to match backend DTOs:

- `RegisterRequest`: All fields with proper validation rules
- `UpdateProfileRequest`: Extended fields list
- `User`: Complete user model with all backend fields

## Testing

### With Mock Backend (Default)

```bash
npm run dev
```

- MSW will intercept API calls
- Mock responses match real backend structure
- Perfect for UI development without backend

### With Real Backend

```bash
VITE_API_BASE_URL=http://localhost:8081/api npm run dev
```

Or create a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8081/api
```

Then run:

```bash
npm run dev
```

## Backend Validation Rules

### Phone Number

Pattern: `^(\+88)?01[3-9]\d{8}$`

- Must be a valid Bangladesh mobile number
- Optional country code (+88)
- Must start with 01
- Third digit must be 3-9
- Total of 11 digits after country code

Examples:

- ✅ `01712345678`
- ✅ `+8801712345678`
- ❌ `01112345678` (second digit can't be 1)
- ❌ `01234567` (too short)

### Password

- Minimum 6 characters
- No maximum length specified

### Name

- Minimum 2 characters
- Maximum 100 characters

### Email

- Must be valid email format
- Checked for uniqueness on backend

## Error Handling

The frontend now properly handles backend errors:

### Duplicate Email

```json
{
  "error": "Email already registered"
}
```

### Duplicate Phone

```json
{
  "error": "Phone number already registered"
}
```

### Validation Errors

Backend validation errors are caught and displayed via toast notifications.

## Next Steps

1. **Login Flow**: Already implemented to work with `/api/users/login`
2. **Profile Update**: Use `updateProfile()` function with new fields
3. **Email/Phone Verification**: Backend sends codes, frontend can call verify endpoints
4. **Password Reset**: Forgot password and reset flows already implemented

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# For local development with backend
VITE_API_BASE_URL=http://localhost:8081/api

# For production
VITE_API_BASE_URL=https://api.boisheba.com/api
```

## CORS Configuration

Ensure your Spring Boot backend has CORS configured for the frontend origin:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:8080") // Vite dev server
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Security Notes

1. **JWT Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration**: Automatically handled; expired tokens trigger re-login
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Never commit real API URLs or secrets to git

## API Endpoints Used

### User Service (Port 8081)

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `POST /api/users/verify-email` - Verify email with code
- `POST /api/users/verify-phone` - Verify phone with code
- `PUT /api/users/{userId}/trust-score` - Update trust score
- `POST /api/users/search` - Search users (paginated)
- `GET /api/users/admin/stats` - Get user statistics (admin)

## Troubleshooting

### "Authentication required" Error

- Check if token is stored: Open DevTools → Application → Local Storage
- Verify token hasn't expired
- Try logging out and back in

### "CORS Error"

- Ensure backend CORS configuration allows frontend origin
- Check if backend is running on correct port (8081)
- Verify VITE_API_BASE_URL is set correctly

### "Network Error"

- Confirm backend is running: `curl http://localhost:8081/api/users/health`
- Check firewall settings
- Verify API base URL in environment variables

### Phone Validation Error

- Ensure phone follows Bangladesh format
- Country code is optional but if provided must be +88
- Must start with 01[3-9]

## Support

For issues or questions:

1. Check browser console for detailed error messages
2. Verify backend logs for API errors
3. Ensure all environment variables are set correctly
4. Test with MSW first to isolate frontend issues
