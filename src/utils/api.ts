// src/utils/api.ts

/**
 * API Client for BoiSheba
 *
 * Supports microservices architecture with separate User and Book services.
 * Book Service endpoints use VITE_BOOK_SERVICE_URL (port 8082)
 * User Service endpoints use VITE_USER_SERVICE_URL (port 8081)
 */

const userServiceBase = import.meta.env.VITE_USER_SERVICE_URL as string | undefined;
const bookServiceBase = import.meta.env.VITE_BOOK_SERVICE_URL as string | undefined;
const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Default to User Service for backwards compatibility
const API_BASE = (envBase && envBase.length > 0
  ? envBase.replace(/\/+$/, "")
  : "/api");

// Book Service URL (defaults to API_BASE if not set)
const BOOK_SERVICE_BASE = (bookServiceBase && bookServiceBase.length > 0
  ? bookServiceBase.replace(/\/+$/, "")
  : API_BASE);

// User Service URL (defaults to API_BASE if not set)
const USER_SERVICE_BASE = (userServiceBase && userServiceBase.length > 0
  ? userServiceBase.replace(/\/+$/, "")
  : API_BASE);

const ACCESS_TOKEN_KEY = "boisheba.auth.accessToken";
const TOKEN_TYPE_KEY = "boisheba.auth.tokenType";
const TOKEN_EXPIRY_KEY = "boisheba.auth.tokenExpiry";
const REFRESH_TOKEN_KEY = "boisheba.auth.refreshToken";
const USER_STORAGE_KEY = "boisheba.auth.user";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

interface ApiFetchOptions extends RequestInit {
  method?: ApiMethod;
  requiresAuth?: boolean;
  serviceBase?: string; // Override service base URL
}

const isBrowser = () => typeof window !== "undefined";

// ---------------------------
// Types
// ---------------------------

// Book Category enum matching Spring Boot
export enum BookCategory {
  FICTION = "FICTION",
  NON_FICTION = "NON_FICTION",
  ACADEMIC = "ACADEMIC",
  RELIGIOUS = "RELIGIOUS",
  CHILDREN = "CHILDREN",
  BIOGRAPHY = "BIOGRAPHY",
  HISTORY = "HISTORY",
  SCIENCE = "SCIENCE",
  TECHNOLOGY = "TECHNOLOGY",
  ARTS = "ARTS",
  OTHER = "OTHER"
}

// Book Condition enum matching Spring Boot
export enum BookCondition {
  NEW = "NEW",
  LIKE_NEW = "LIKE_NEW",
  VERY_GOOD = "VERY_GOOD",
  GOOD = "GOOD",
  ACCEPTABLE = "ACCEPTABLE",
  POOR = "POOR"
}

// Book Status enum matching Spring Boot
export enum BookStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  BORROWED = "BORROWED",
  DELETED = "DELETED"
}

// Book interface matching Spring Boot BookResponse DTO
export interface Book {
  id: number;
  ownerId: number;
  ownerName?: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  category: BookCategory;
  description?: string;
  condition: BookCondition;
  language?: string;
  totalPages?: number;
  publicationYear?: number;
  available: boolean;
  suggestedDeposit: number;
  rentalPricePerDay: number;
  coverImageUrl?: string;
  titlePageImageUrl?: string;
  verified?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  viewCount?: number;
  borrowCount?: number;
  averageRating?: number;
  status: BookStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  distanceKm?: number;
}

// OCR Response matching Spring Boot OcrResponse DTO
export interface OcrResponse {
  title?: string | null;
  author?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  edition?: string | null;
  category?: string | null;
  publication_year?: string | null;
  language?: string | null;
  description?: string | null;
  error?: string | null;
  [key: string]: unknown;
}

// Damage Detection Response matching Spring Boot DamageDetectionResponse DTO
export interface DamageDetectionResponse {
  status: string;
  image_shape?: {
    width: number;
    height: number;
  };
  roboflow_response?: any;
  message?: string;
}

// Create Book Request matching Spring Boot CreateBookRequest DTO
export interface CreateBookRequest {
  ownerId: number;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  category: BookCategory;
  description?: string;
  condition: BookCondition;
  language?: string;
  totalPages?: number;
  publicationYear?: number;
  suggestedDeposit: number;
  rentalPricePerDay: number;
  coverImageUrl?: string;
  titlePageImageUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string;
}

// Update Book Request matching Spring Boot UpdateBookRequest DTO
export interface UpdateBookRequest {
  title?: string;
  author?: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  category?: BookCategory;
  description?: string;
  condition?: BookCondition;
  language?: string;
  totalPages?: number;
  publicationYear?: number;
  available?: boolean;
  suggestedDeposit?: number;
  rentalPricePerDay?: number;
  coverImageUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string;
}

// Search Book Request matching Spring Boot SearchBookRequest DTO
export interface SearchBookRequest {
  keyword?: string;
  category?: BookCategory;
  latitude?: number;
  longitude?: number;
  sortBy?: string;
  page?: number;
  size?: number;
}

// Book Stats Response matching Spring Boot BookStatsResponse DTO
export interface BookStatsResponse {
  totalBooks: number;
  activeBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  pendingApproval: number;
  booksByCategory: Record<string, number>;
  booksByStatus: Record<string, number>;
}

// Recommendation Response matching Spring Boot RecommendationResponse DTO
export interface RecommendationResponse {
  recommendedBooks: Book[];
  reason: string;
}

// Approve Book Request matching Spring Boot ApproveBookRequest DTO
export interface ApproveBookRequest {
  bookId: number;
  approved: boolean;
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  avatar?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  trustScore?: number | null;
  totalBooksListed?: number | null;
  totalBooksBorrowed?: number | null;
  totalBooksLent?: number | null;
  completedTransactions?: number | null;
  cancelledTransactions?: number | null;
  overdueTransactions?: number | null;
  averageRating?: number | null;
  totalRatings?: number | null;
  role?: string | null;
  status?: string | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  reputation?: number | null;
  isActive?: boolean;
  booksShared?: number | null;
  isAdmin?: boolean;
  roles?: string[];
  [key: string]: unknown;
}

export interface BorrowRequest {
  bookId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  deposit: number;
}

export interface Transaction {
  id: string;
  bookId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
  totalCost: number;
  deposit: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  [key: string]: unknown;
}

export interface UserSearchRequest {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  roles?: string[];
  [key: string]: unknown;
}

export interface AuthResponse {
  user?: unknown;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  jwt?: string;
  tokenType?: string;
  expiresIn?: number;
  data?: {
    user?: unknown;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
  };
  [key: string]: unknown;
}

export interface StoredAuth {
  token: string;
  refreshToken?: string;
  user: User;
  tokenType?: string;
  expiresAt?: number;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  code: string;
}

export interface VerifyPhonePayload {
  code: string;
}

// ---------------------------
// Helpers
// ---------------------------

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

const buildUrl = (path: string, serviceBase?: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = serviceBase || API_BASE;
  return `${base}${normalizedPath}`;
};

const readErrorMessage = async (response: Response) => {
  try {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (typeof data === "string") return data;
      if (data?.message) return data.message as string;
      if (data?.error) return data.error as string;
      return JSON.stringify(data);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof Error) return error.message;
    return response.statusText;
  }
};

async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { requiresAuth = false, headers, method = "GET", body, serviceBase, ...rest } = options;

  const finalHeaders = new Headers(headers ?? undefined);

  // Only set Content-Type for JSON - FormData will set its own with boundary
  if (body && !finalHeaders.has("Content-Type") && !isFormData(body)) {
    finalHeaders.set("Content-Type", "application/json");
  }

  // Remove Content-Type for FormData to let browser set it with boundary
  if (isFormData(body) && finalHeaders.has("Content-Type")) {
    finalHeaders.delete("Content-Type");
  }

  if (requiresAuth) {
    const auth = getStoredAuth();
    if (!auth?.token) {
      throw new Error("Authentication required");
    }
    if (auth.expiresAt && auth.expiresAt > 0 && auth.expiresAt < Date.now()) {
      clearAuthSession();
      throw new Error("Session expired. Please sign in again.");
    }
    const scheme = auth.tokenType?.trim() || "Bearer";
    finalHeaders.set("Authorization", `${scheme} ${auth.token}`);
  }

  const requestUrl = buildUrl(path, serviceBase);
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      method,
      body,
      headers: finalHeaders,
      ...rest,
    });
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Network request failed. Please verify the backend service URL, server availability, and CORS configuration."
      );
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unexpected network error occurred");
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204 || method === "HEAD") {
    return undefined as T;
  }

  const responseType = response.headers.get("Content-Type") || "";
  if (responseType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

const normalizeUser = (raw: unknown): User => {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid user payload received from server");
  }

  const candidate = raw as Record<string, unknown>;
  const idValue = candidate.id ?? candidate.userId ?? candidate.uid ?? candidate._id;
  if (idValue === undefined || idValue === null) {
    throw new Error("User payload is missing an identifier");
  }

  const firstName = candidate.firstName as string | undefined;
  const lastName = candidate.lastName as string | undefined;
  const fallbackName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const fullName = (candidate.fullName as string | undefined)
    ?? (candidate.name as string | undefined)
    ?? fallbackName
    ?? (candidate.username as string | undefined)
    ?? (candidate.email as string | undefined)
    ?? "User";

  const roles = Array.isArray(candidate.roles)
    ? (candidate.roles as unknown[]).map((role) => String(role))
    : candidate.role
    ? [String(candidate.role)]
    : undefined;

  const isAdmin = candidate.isAdmin as boolean | undefined
    ?? (roles ? roles.some((role) => role.toLowerCase().includes("admin")) : undefined);

  const rawPhone = candidate.phone ?? candidate.phoneNumber ?? candidate.mobile;
  const rawAvatar = candidate.avatar ?? candidate.profileImage ?? candidate.profileImageUrl ?? candidate.imageUrl;
  const rawReputation = candidate.reputation ?? candidate.rating ?? candidate.averageRating;
  const rawTrustScore = candidate.trustScore ?? candidate.score;
  const rawBooksShared = candidate.booksShared ?? candidate.totalBooksShared ?? candidate.totalBooksListed;

  return {
    ...candidate,
    id: String(idValue),
    name: fullName,
    email: String(candidate.email ?? ""),
    phone: rawPhone !== undefined && rawPhone !== null ? String(rawPhone) : undefined,
    avatar: rawAvatar !== undefined && rawAvatar !== null ? String(rawAvatar) : undefined,
    profileImageUrl: rawAvatar !== undefined && rawAvatar !== null ? String(rawAvatar) : undefined,
    reputation: rawReputation !== undefined && rawReputation !== null ? Number(rawReputation) : undefined,
    trustScore: rawTrustScore !== undefined && rawTrustScore !== null ? Number(rawTrustScore) : undefined,
    isActive:
      (candidate.status === "ACTIVE" ? true : candidate.status === "INACTIVE" ? false : undefined)
      ?? (typeof candidate.isActive === "boolean" ? candidate.isActive : undefined)
      ?? (typeof candidate.active === "boolean" ? candidate.active : undefined)
      ?? (typeof candidate.enabled === "boolean" ? candidate.enabled : undefined),
    booksShared: rawBooksShared !== undefined && rawBooksShared !== null ? Number(rawBooksShared) : undefined,
    isAdmin,
    roles,
  };
};

const extractToken = (payload: AuthResponse): string => {
  const directToken = payload.token
    ?? payload.accessToken
    ?? payload.jwt
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).token : undefined)
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).accessToken : undefined);

  if (!directToken || typeof directToken !== "string") {
    throw new Error("Authentication response did not include an access token");
  }
  return directToken;
};

const extractRefreshToken = (payload: AuthResponse): string | undefined => {
  const token = payload.refreshToken
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).refreshToken : undefined);
  return typeof token === "string" ? token : undefined;
};

const extractTokenType = (payload: AuthResponse): string | undefined => {
  const type = payload.tokenType
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).tokenType : undefined);
  return typeof type === "string" && type.length > 0 ? type : undefined;
};

const extractExpiry = (payload: AuthResponse): number | undefined => {
  const expiresIn = payload.expiresIn
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).expiresIn : undefined);
  if (typeof expiresIn !== "number" || Number.isNaN(expiresIn) || expiresIn <= 0) {
    return undefined;
  }
  return Date.now() + expiresIn * 1000;
};

const extractUser = (payload: AuthResponse): User => {
  const userPayload = payload.user
    ?? (payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>).user : undefined);
  return normalizeUser(userPayload ?? payload);
};

const toStoredAuth = (payload: AuthResponse): StoredAuth => ({
  token: extractToken(payload),
  refreshToken: extractRefreshToken(payload),
  user: extractUser(payload),
  tokenType: extractTokenType(payload),
  expiresAt: extractExpiry(payload),
});

// ---------------------------
// Auth storage helpers
// ---------------------------

export const getStoredAuth = (): StoredAuth | null => {
  if (!isBrowser()) return null;

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  let user: User | null = null;
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (rawUser) {
    try {
      user = normalizeUser(JSON.parse(rawUser));
    } catch (error) {
      console.warn("Failed to parse stored user", error);
    }
  }

  if (!user) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }

  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
  const tokenType = window.localStorage.getItem(TOKEN_TYPE_KEY) ?? undefined;
  const expiryRaw = window.localStorage.getItem(TOKEN_EXPIRY_KEY);
  const expiresAt = expiryRaw ? Number.parseInt(expiryRaw, 10) : undefined;

  if (expiresAt && expiresAt > 0 && expiresAt < Date.now()) {
    clearAuthSession();
    return null;
  }

  return { token, refreshToken, user, tokenType: tokenType || undefined, expiresAt };
};

export const storeAuthSession = (auth: StoredAuth) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, auth.token);

  if (auth.tokenType) {
    window.localStorage.setItem(TOKEN_TYPE_KEY, auth.tokenType);
  } else {
    window.localStorage.removeItem(TOKEN_TYPE_KEY);
  }

  if (auth.expiresAt) {
    window.localStorage.setItem(TOKEN_EXPIRY_KEY, String(auth.expiresAt));
  } else {
    window.localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  if (auth.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_TYPE_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRY_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

const updateStoredUser = (user: User) => {
  const existing = getStoredAuth();
  if (existing) {
    storeAuthSession({ ...existing, user });
  }
};

// ---------------------------
// Books API - Matching Spring Boot BookController
// Uses BOOK_SERVICE_BASE (port 8082)
// ---------------------------

/**
 * POST /api/books/ocr - Perform OCR on an uploaded image
 */
export async function performOcr(imageFile: File): Promise<OcrResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  return apiFetch<OcrResponse>("/books/ocr", {
    method: "POST",
    body: formData,
    serviceBase: BOOK_SERVICE_BASE,
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  });
}

/**
 * POST /api/books/damage-detection - Perform damage detection on an uploaded image
 */
export async function performDamageDetection(imageFile: File): Promise<DamageDetectionResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  return apiFetch<DamageDetectionResponse>("/books/damage-detection", {
    method: "POST",
    body: formData,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * POST /damage-detection - Perform damage detection using FastAPI service (localhost:8000)
 * This directly calls the FastAPI damage detection endpoint
 */
export async function performDamageDetectionFastAPI(imageFile: File): Promise<DamageDetectionResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  // Directly call the FastAPI service at localhost:8000
  try {
    const response = await fetch("http://localhost:8000/damage-detection", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Damage detection failed: ${error.message}`);
    }
    throw new Error("Damage detection failed with unknown error");
  }
}

/**
 * POST /api/books - Create a new book
 */
export async function createBook(request: CreateBookRequest): Promise<Book> {
  return apiFetch<Book>("/books", {
    method: "POST",
    body: JSON.stringify(request),
    requiresAuth: true,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * PUT /api/books/:bookId - Update book details
 */
export async function updateBook(bookId: number, request: UpdateBookRequest): Promise<Book> {
  return apiFetch<Book>(`/books/${bookId}`, {
    method: "PUT",
    body: JSON.stringify(request),
    requiresAuth: true,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/:bookId - Get book by ID (increments view count)
 */
export async function getBookById(bookId: number): Promise<Book> {
  return apiFetch<Book>(`/books/${bookId}`, {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/owner/:ownerId - Get books by owner
 */
export async function getBooksByOwner(ownerId: number, page = 0, size = 20): Promise<Page<Book>> {
  return apiFetch<Page<Book>>(`/books/owner/${ownerId}?page=${page}&size=${size}`, {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/available - Get all available books
 */
export async function getAvailableBooks(page = 0, size = 20): Promise<Page<Book>> {
  return apiFetch<Page<Book>>(`/books/available?page=${page}&size=${size}`, {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * POST /api/books/search - Search books with filters
 */
export async function searchBooks(request: SearchBookRequest): Promise<Page<Book>> {
  return apiFetch<Page<Book>>("/books/search", {
    method: "POST",
    body: JSON.stringify(request),
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/nearby - Get nearby books by location
 */
export async function getNearbyBooks(
  latitude: number,
  longitude: number,
  radiusKm = 10.0
): Promise<Book[]> {
  return apiFetch<Book[]>(
    `/books/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
    { serviceBase: BOOK_SERVICE_BASE }
  );
}

/**
 * GET /api/books/popular - Get popular books
 */
export async function getPopularBooks(page = 0, size = 20): Promise<Page<Book>> {
  return apiFetch<Page<Book>>(`/books/popular?page=${page}&size=${size}`, {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/:bookId/recommendations - Get recommended books
 */
export async function getRecommendedBooks(bookId: number): Promise<RecommendationResponse> {
  return apiFetch<RecommendationResponse>(`/books/${bookId}/recommendations`, {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * PUT /api/books/:bookId/availability - Update book availability
 */
export async function updateBookAvailability(bookId: number, available: boolean): Promise<string> {
  return apiFetch<string>(`/books/${bookId}/availability?available=${available}`, {
    method: "PUT",
    requiresAuth: true,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * POST /api/books/approve - Approve or reject book (Admin)
 */
export async function approveBook(request: ApproveBookRequest): Promise<Book> {
  return apiFetch<Book>("/books/approve", {
    method: "POST",
    body: JSON.stringify(request),
    requiresAuth: true,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * DELETE /api/books/:bookId - Delete book (soft delete)
 */
export async function deleteBook(bookId: number): Promise<string> {
  return apiFetch<string>(`/books/${bookId}`, {
    method: "DELETE",
    requiresAuth: true,
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/stats - Get book statistics
 */
export async function getBookStats(): Promise<BookStatsResponse> {
  return apiFetch<BookStatsResponse>("/books/stats", {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

/**
 * GET /api/books/health - Health check
 */
export async function bookServiceHealthCheck(): Promise<string> {
  return apiFetch<string>("/books/health", {
    serviceBase: BOOK_SERVICE_BASE,
  });
}

// Legacy compatibility function - maps old interface to new
export async function getBooks(query?: string): Promise<Book[]> {
  const request: SearchBookRequest = {
    keyword: query,
    page: 0,
    size: 100,
  };
  const page = await searchBooks(request);
  return page.content;
}

export async function compareBookCondition(
  bookId: string,
  currentImage: string
): Promise<{ similarity: number; differences: string[] }> {
  return apiFetch(`/books/${bookId}/compare`, {
    method: "POST",
    body: JSON.stringify({ currentImage }),
    requiresAuth: true,
  });
}

export async function createTransaction(transactionData: {
  bookId: string;
  borrowerId: string;
  lenderId?: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  deposit: number;
  status: string;
}): Promise<Transaction> {
  return apiFetch<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(transactionData),
    requiresAuth: true,
  });
}

// ---------------------------
// User Auth & Profile API
// Uses USER_SERVICE_BASE (port 8081)
// ---------------------------

export async function loginUser(payload: LoginPayload): Promise<StoredAuth> {
  const response = await apiFetch<AuthResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
    serviceBase: USER_SERVICE_BASE,
  });

  const normalized = toStoredAuth(response);
  storeAuthSession(normalized);
  return normalized;
}

export async function registerUser(payload: RegisterPayload): Promise<StoredAuth> {
  const response = await apiFetch<AuthResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
    serviceBase: USER_SERVICE_BASE,
  });

  const normalized = toStoredAuth(response);
  storeAuthSession(normalized);
  return normalized;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch<unknown>("/users/me", {
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });

  const user = normalizeUser(response);
  updateStoredUser(user);
  return user;
}

export async function getUser(userId: string | number): Promise<User> {
  const response = await apiFetch<unknown>(`/users/${userId}`, {
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });
  return normalizeUser(response);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiFetch<unknown>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });

  const user = normalizeUser(response);
  updateStoredUser(user);
  return user;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return apiFetch<string>("/users/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
  return apiFetch<string>("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  return apiFetch<string>("/users/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<string> {
  return apiFetch<string>("/users/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function verifyPhone(payload: VerifyPhonePayload): Promise<string> {
  return apiFetch<string>("/users/verify-phone", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function updateTrustScore(userId: string | number, score: number): Promise<string> {
  return apiFetch<string>(`/users/${userId}/trust-score?score=${score}`, {
    method: "PUT",
    serviceBase: USER_SERVICE_BASE,
  });
}

export async function searchUsers(request: UserSearchRequest = {}): Promise<Page<User>> {
  const response = await apiFetch<Page<unknown>>("/users/search", {
    method: "POST",
    body: JSON.stringify(request),
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });

  const rawContent = Array.isArray(response.content)
    ? (response.content as unknown[])
    : [];

  return {
    ...response,
    content: rawContent.map(normalizeUser),
  } as Page<User>;
}

export async function getUsers(request: UserSearchRequest = {}): Promise<User[]> {
  const page = await searchUsers(request);
  return page.content;
}

export async function getUserStats(): Promise<UserStatsResponse> {
  return apiFetch<UserStatsResponse>("/users/admin/stats", {
    requiresAuth: true,
    serviceBase: USER_SERVICE_BASE,
  });
}

// ---------------------------
// Transactions API
// ---------------------------

export async function createBorrowRequest(
  request: BorrowRequest
): Promise<Transaction> {
  return apiFetch<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(request),
    requiresAuth: true,
  });
}

export async function getMyTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/transactions/my", {
    requiresAuth: true,
  });
}

// ---------------------------
// Admin: Transactions API
// ---------------------------

export async function getTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/admin/transactions", {
    requiresAuth: true,
  });
}

export async function updateTransactionStatus(
  transactionId: string,
  status: string
): Promise<Transaction> {
  return apiFetch<Transaction>(`/admin/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    requiresAuth: true,
  });
}

// ---------------------------
// Recommendations API
// ---------------------------

export async function getRecommendations(userId: string): Promise<Book[]> {
  return apiFetch<Book[]>(`/recommendations?userId=${encodeURIComponent(userId)}`);
}
