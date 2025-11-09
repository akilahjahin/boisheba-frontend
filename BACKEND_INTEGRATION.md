# Backend Integration Guide - BoiSheba Frontend# Backend Integration Guide

This document explains how the frontend has been integrated with the Spring Boot backend book service.## Overview

## ✅ What Has Been IntegratedThe frontend is now fully integrated with the Spring Boot User Service backend. The integration includes proper type mappings, authentication flows, and session management.

### 1. API Layer (`src/utils/api.ts`)## Changes Made

#### New TypeScript Interfaces### 1. Updated Type Definitions (`src/utils/api.ts`)

All interfaces now match Spring Boot DTOs exactly:

#### User Interface

- **Book** - Maps to `BookResponse.java`

- **BookCategory** enum - Maps to `Book.BookCategory.java`Extended the `User` interface to match the backend `UserResponse` DTO:

- **BookCondition** enum - Maps to `Book.BookCondition.java`

- **BookStatus** enum - Maps to `Book.BookStatus.java`- Added all backend fields: `profileImageUrl`, `bio`, `address`, `city`, `district`, `postalCode`, `latitude`, `longitude`

- **OcrResponse** - Maps to `OcrResponse.java`- Added statistics fields: `totalBooksListed`, `totalBooksBorrowed`, `totalBooksLent`, `completedTransactions`, etc.

- **DamageDetectionResponse** - Maps to `DamageDetectionResponse.java`- Added verification fields: `emailVerified`, `phoneVerified`

- **CreateBookRequest** - Maps to `CreateBookRequest.java`- Added timestamps: `lastLoginAt`, `createdAt`

- **UpdateBookRequest** - Maps to `UpdateBookRequest.java`

- **SearchBookRequest** - Maps to `SearchBookRequest.java`#### RegisterPayload Interface

- **BookStatsResponse** - Maps to `BookStatsResponse.java`

- **RecommendationResponse** - Maps to `RecommendationResponse.java`Updated to match the backend `RegisterRequest` DTO:

- **ApproveBookRequest** - Maps to `ApproveBookRequest.java`

````typescript

#### New API Methodsexport interface RegisterPayload {

All methods now call the actual Spring Boot endpoints:  name: string; // Required: 2-100 characters

  email: string; // Required: Valid email

**OCR & Image Processing:**  phone: string; // Required: Bangladesh phone format

```typescript  password: string; // Required: Min 6 characters

performOcr(imageFile: File): Promise<OcrResponse>  address?: string; // Optional

  → POST /api/books/ocr  city?: string; // Optional

  district?: string; // Optional

performDamageDetection(imageFile: File): Promise<DamageDetectionResponse>  postalCode?: string; // Optional

  → POST /api/books/damage-detection  latitude?: number; // Optional

```  longitude?: number; // Optional

}

**Book CRUD Operations:**```

```typescript

createBook(request: CreateBookRequest): Promise<Book>#### AuthResponse Interface

  → POST /api/books

Extended to include:

updateBook(bookId: number, request: UpdateBookRequest): Promise<Book>

  → PUT /api/books/:bookId- `tokenType`: "Bearer"

- `expiresIn`: Token expiration time in milliseconds (86400000 = 24 hours)

getBookById(bookId: number): Promise<Book>

  → GET /api/books/:bookId### 2. Updated Authentication Flow



deleteBook(bookId: number): Promise<string>#### Token Management

  → DELETE /api/books/:bookId

```- Token type is now stored and used in Authorization headers

- Token expiration is tracked and enforced

**Book Search & Filtering:**- Expired sessions are automatically cleared

```typescript- Authorization header format: `Bearer <token>` (or custom token type from backend)

searchBooks(request: SearchBookRequest): Promise<Page<Book>>

  → POST /api/books/search#### Session Storage



getAvailableBooks(page, size): Promise<Page<Book>>New localStorage keys:

  → GET /api/books/available

- `boisheba.auth.accessToken`: JWT token

getBooksByOwner(ownerId, page, size): Promise<Page<Book>>- `boisheba.auth.tokenType`: Token type (e.g., "Bearer")

  → GET /api/books/owner/:ownerId- `boisheba.auth.tokenExpiry`: Expiration timestamp

- `boisheba.auth.refreshToken`: Refresh token (if provided)

getNearbyBooks(latitude, longitude, radiusKm): Promise<Book[]>- `boisheba.auth.user`: User profile data

  → GET /api/books/nearby

### 3. Updated Signup Page (`src/pages/Signup.tsx`)

getPopularBooks(page, size): Promise<Page<Book>>

  → GET /api/books/popular#### Required Fields

````

- Full Name (2-100 characters)

**Recommendations & Stats:**- Email (valid email format)

```typescript- Phone Number (Bangladesh format: `01[3-9]XXXXXXXX`)

getRecommendedBooks(bookId: number): Promise<RecommendationResponse>- Password (minimum 6 characters)

→ GET /api/books/:bookId/recommendations- Confirm Password

getBookStats(): Promise<BookStatsResponse>#### Optional Fields

→ GET /api/books/stats

````- Address

- City

**Admin Operations:**- District

```typescript- Postal Code

approveBook(request: ApproveBookRequest): Promise<Book>

  → POST /api/books/approve#### Layout



updateBookAvailability(bookId, available): Promise<string>- Two-column grid for better UX on desktop

  → PUT /api/books/:bookId/availability- Responsive design with proper mobile support

```- Required fields marked with red asterisk (\*)

- Optional fields grouped in separate section

### 2. Add Book Page (`src/pages/AddBook.tsx`)

### 4. Updated Mock Service Worker (`src/mocks/handlers.ts`)

**Updated Features:**

- ✅ Uses `CreateBookRequest` DTO formatMock responses now match the real backend structure:

- ✅ Includes all Spring Boot fields: `category`, `condition`, `language`, `totalPages`, `publicationYear`, `tags`, etc.

- ✅ Separate cover image and title page image uploads```json

- ✅ Auto-populates form with OCR results from backend{

- ✅ Shows verification status (verified/pending) after creation  "token": "eyJhbGci...",

- ✅ Proper enum dropdowns for Category and Condition  "tokenType": "Bearer",

  "expiresIn": 86400000,

### 3. Upload Image Component (`src/components/UploadImage.tsx`)  "user": {

    "id": 2,

**Completely Rewritten:**    "name": "John Doe",

- ❌ **Removed**: Tesseract.js client-side OCR    "email": "johndoe@example.com",

- ✅ **Added**: Backend OCR API integration via `performOcr()`    "phone": "+8801712345678",

- ✅ Calls Spring Boot `/api/books/ocr` endpoint    "profileImageUrl": null,

- ✅ Parses `OcrResponse.extracted_text` for metadata    "bio": null,

- ✅ Extracts title, author, ISBN, publisher, and publication year    "address": "House 10, Road 5, Dhanmondi",

- ✅ Shows processing status and results    "city": "Dhaka",

- ✅ Handles errors gracefully with fallback    "district": "Dhaka",

    "postalCode": "1209",

### 4. Environment Configuration    "latitude": 23.746466,

    "longitude": 90.376015,

**`.env` File:**    "trustScore": 50.0,

```bash    "totalBooksListed": 0,

VITE_API_BASE_URL=http://localhost:8081/api    "totalBooksBorrowed": 0,

VITE_ENABLE_OPEN_LIBRARY=false    "totalBooksLent": 0,

VITE_ENABLE_BLOCKCHAIN=false    "completedTransactions": 0,

```    "averageRating": 0.0,

    "totalRatings": 0,

**How It Works:**    "role": "USER",

- When `VITE_API_BASE_URL` is set → Uses real Spring Boot backend    "status": "ACTIVE",

- When `VITE_API_BASE_URL` is empty → Falls back to MSW mock API    "emailVerified": false,

    "phoneVerified": false,

### 5. FormData Handling    "lastLoginAt": null,

    "createdAt": "2025-11-08T01:21:43.608109"

**MultipartFile Support:**  }

- Updated `apiFetch()` helper to properly handle `FormData`}

- Automatically removes `Content-Type` header for multipart uploads (browser sets it with boundary)```

- OCR and damage detection endpoints send images as `multipart/form-data`

### 5. Updated OpenAPI Specification (`openapi.yaml`)

## 🔧 Spring Boot Backend Requirements

Updated schemas to match backend DTOs:

### Expected Endpoints

- `RegisterRequest`: All fields with proper validation rules

Your Spring Boot backend must be running on `http://localhost:8081` with these endpoints:- `UpdateProfileRequest`: Extended fields list

- `User`: Complete user model with all backend fields

````

POST /api/books/ocr - OCR image upload## Testing

POST /api/books/damage-detection - Damage detection

POST /api/books - Create book### With Mock Backend (Default)

PUT /api/books/:id - Update book

GET /api/books/:id - Get book by ID```bash

DELETE /api/books/:id - Delete booknpm run dev

POST /api/books/search - Search books```

GET /api/books/available - Get available books

GET /api/books/owner/:ownerId - Get books by owner- MSW will intercept API calls

GET /api/books/nearby - Get nearby books- Mock responses match real backend structure

GET /api/books/popular - Get popular books- Perfect for UI development without backend

GET /api/books/:id/recommendations - Get recommendations

POST /api/books/approve - Approve/reject book### With Real Backend

PUT /api/books/:id/availability - Update availability

GET /api/books/stats - Get statistics```bash

GET /api/books/health - Health checkVITE_API_BASE_URL=http://localhost:8081/api npm run dev

````



### CORS ConfigurationOr create a `.env` file:



Add this to your Spring Boot application:```bash

VITE_API_BASE_URL=http://localhost:8081/api

```java```

@Configuration

public class CorsConfig {Then run:

    @Bean

    public WebMvcConfigurer corsConfigurer() {```bash

        return new WebMvcConfigurer() {npm run dev

            @Override```

            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/api/**")## Backend Validation Rules

                        .allowedOrigins("http://localhost:5173") // Vite dev server

                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")### Phone Number

                        .allowedHeaders("*")

                        .allowCredentials(true);Pattern: `^(\+88)?01[3-9]\d{8}$`

            }

        };- Must be a valid Bangladesh mobile number

    }- Optional country code (+88)

}- Must start with 01

```- Third digit must be 3-9

- Total of 11 digits after country code

## 🚀 How to Run

Examples:

### 1. Start Spring Boot Backend

- ✅ `01712345678`

```bash- ✅ `+8801712345678`

cd book-service- ❌ `01112345678` (second digit can't be 1)

./mvnw spring-boot:run- ❌ `01234567` (too short)

```

### Password

Backend should be running on `http://localhost:8081`

- Minimum 6 characters

### 2. Start Frontend- No maximum length specified



```bash### Name

cd boisheba-frontend

npm install- Minimum 2 characters

npm run dev- Maximum 100 characters

```

### Email

Frontend will start on `http://localhost:5173`

- Must be valid email format

### 3. Test the Integration- Checked for uniqueness on backend



#### Test OCR Feature:## Error Handling

1. Go to **Add Book** page (`/add-book`)

2. Upload a title page image (must contain book title, author, ISBN)The frontend now properly handles backend errors:

3. Backend OCR will process the image

4. Form fields will auto-populate with extracted data### Duplicate Email

5. Submit the form

```json

#### Test Book Creation:{

1. Fill in the form manually or use OCR  "error": "Email already registered"

2. Select Category (Fiction, Non-Fiction, etc.)}

3. Select Condition (New, Like New, Good, etc.)```

4. Set daily rental rate and deposit

5. Click "Add Book"### Duplicate Phone

6. Backend will:

   - Create the book```json

   - Perform OCR verification (if title page provided){

   - Auto-approve if verified  "error": "Phone number already registered"

   - Return book with `verified: true/false` status}

```

## 🔍 Debugging

### Validation Errors

### Check Backend Connection

Backend validation errors are caught and displayed via toast notifications.

Open browser console and look for:

```## Next Steps

POST http://localhost:8081/api/books/ocr

```1. **Login Flow**: Already implemented to work with `/api/users/login`

2. **Profile Update**: Use `updateProfile()` function with new fields

### Common Issues3. **Email/Phone Verification**: Backend sends codes, frontend can call verify endpoints

4. **Password Reset**: Forgot password and reset flows already implemented

**1. CORS Errors**

```## Environment Variables

Access to fetch at 'http://localhost:8081/api/books/ocr' from origin 'http://localhost:5173' has been blocked by CORS

```Copy `.env.example` to `.env` and configure:

**Solution**: Add CORS configuration to Spring Boot (see above)

```bash

**2. 404 Not Found**# For local development with backend

```VITE_API_BASE_URL=http://localhost:8081/api

POST http://localhost:8081/api/books/ocr → 404

```# For production

**Solution**: Ensure Spring Boot is running and endpoint existsVITE_API_BASE_URL=https://api.boisheba.com/api

```

**3. OCR Not Working**

```## CORS Configuration

Error: OCR processing failed

```Ensure your Spring Boot backend has CORS configured for the frontend origin:

**Solution**: Check that FastAPI OCR service is running (Google Gemini integration)

```java

**4. Form Not Auto-Populating**@Configuration

```public class CorsConfig {

OCR completed but form fields empty    @Bean

```    public WebMvcConfigurer corsConfigurer() {

**Solution**: Check browser console for parsed metadata. OCR text might not contain expected fields.        return new WebMvcConfigurer() {

            @Override

## 📊 Data Flow Diagram            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/api/**")

```                    .allowedOrigins("http://localhost:8080") // Vite dev server

User Uploads Image                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")

      ↓                    .allowedHeaders("*")

UploadImage Component                    .allowCredentials(true);

      ↓            }

performOcr(imageFile) in api.ts        };

      ↓    }

POST /api/books/ocr (Spring Boot)}

      ↓```

FastAPI OCR Service (Google Gemini)

      ↓## Security Notes

OcrResponse { status, extracted_text, image_shape }

      ↓1. **JWT Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)

parseBookMetadata(extracted_text)2. **Token Expiration**: Automatically handled; expired tokens trigger re-login

      ↓3. **HTTPS**: Always use HTTPS in production

Extract: title, author, ISBN, publisher, year4. **Environment Variables**: Never commit real API URLs or secrets to git

      ↓

Auto-populate form fields in AddBook## API Endpoints Used

      ↓

User reviews/edits### User Service (Port 8081)

      ↓

Submit form → createBook(request)- `POST /api/users/register` - User registration

      ↓- `POST /api/users/login` - User authentication

POST /api/books (Spring Boot)- `GET /api/users/me` - Get current user profile

      ↓- `PUT /api/users/profile` - Update user profile

BookService creates book with OCR verification- `POST /api/users/change-password` - Change password

      ↓- `POST /api/users/forgot-password` - Request password reset

Returns Book { id, verified, status, ... }- `POST /api/users/reset-password` - Reset password with token

      ↓- `POST /api/users/verify-email` - Verify email with code

Show success message- `POST /api/users/verify-phone` - Verify phone with code

      ↓- `PUT /api/users/{userId}/trust-score` - Update trust score

Navigate to Dashboard- `POST /api/users/search` - Search users (paginated)

```- `GET /api/users/admin/stats` - Get user statistics (admin)



## 🎯 Features Still Using Mock API## Troubleshooting



The following features are still using MSW mocks (not integrated with backend):### "Authentication required" Error



- ❌ User authentication (`/api/users/login`, `/api/users/register`)- Check if token is stored: Open DevTools → Application → Local Storage

- ❌ User profile (`/api/users/me`, `/api/users/profile`)- Verify token hasn't expired

- ❌ Transactions (`/api/transactions`)- Try logging out and back in

- ❌ Book comparison/damage detection UI (endpoint exists but not used in UI yet)

- ❌ Admin user management### "CORS Error"

- ❌ Search filters in Books page

- Ensure backend CORS configuration allows frontend origin

To disable MSW mocks completely, comment out this line in `src/main.tsx`:- Check if backend is running on correct port (8081)

- Verify VITE_API_BASE_URL is set correctly

```typescript

// if (import.meta.env.DEV) {### "Network Error"

//   import('./mocks/browser').then(({ worker }) => {

//     worker.start();- Confirm backend is running: `curl http://localhost:8081/api/users/health`

//   });- Check firewall settings

// }- Verify API base URL in environment variables

```

### Phone Validation Error

## 🔐 Authentication

- Ensure phone follows Bangladesh format

Currently, the frontend stores authentication in `localStorage`:- Country code is optional but if provided must be +88

- `boisheba.auth.accessToken`- Must start with 01[3-9]

- `boisheba.auth.user`

## Support

The `createBook` API call requires authentication:

```typescriptFor issues or questions:

const auth = getStoredAuth();

if (!auth?.user?.id) {1. Check browser console for detailed error messages

  toast.error("Please login to add a book");2. Verify backend logs for API errors

  navigate("/login");3. Ensure all environment variables are set correctly

  return;4. Test with MSW first to isolate frontend issues

}
```

Ensure your Spring Boot backend validates the JWT token from the `Authorization: Bearer <token>` header.

## 📝 Next Steps

To fully integrate the backend, you should:

1. ✅ **Books API** - DONE
2. ⏳ **Update Books.tsx** - Integrate pagination and search
3. ⏳ **Update BookDetail.tsx** - Integrate damage detection
4. ⏳ **User Service Integration** - Connect authentication endpoints
5. ⏳ **Transaction Service Integration** - Connect borrow/lend flow
6. ⏳ **Admin Panel Integration** - Connect admin approval endpoints

## 🐛 Known Issues

1. **Image URLs**: Frontend currently stores base64 data URLs. You may want to upload images to cloud storage (S3, Cloudinary) and store URLs in the database.

2. **Pagination**: Books.tsx needs to be updated to use the `Page<Book>` response format from Spring Boot.

3. **Legacy Format**: Some older components still expect the old `{ id: string, images: string[], dailyRate: number }` format. They need to be updated to use the new `{ id: number, coverImageUrl: string, rentalPricePerDay: number }` format.

## 📚 References

- **Spring Boot Book Service**: `org.boisheba.bookservice.controller.BookController`
- **Frontend API Client**: `src/utils/api.ts`
- **Add Book Component**: `src/pages/AddBook.tsx`
- **Upload Component**: `src/components/UploadImage.tsx`
- **Environment Config**: `.env`

---

**Integration Status**: ✅ Book Service APIs fully integrated
**Last Updated**: November 8, 2025
**Author**: GitHub Copilot
````
