// src/utils/api.ts

/**
 * API Client for BoiSheba
 *
 * Replace MSW mocks with the real backend by setting VITE_API_BASE_URL
 * to the Spring Boot server origin (e.g. http://localhost:8081/api).
 */

const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE = (envBase && envBase.length > 0
  ? envBase.replace(/\/+$/, "")
  : "/api");

const ACCESS_TOKEN_KEY = "boisheba.auth.accessToken";
const TOKEN_TYPE_KEY = "boisheba.auth.tokenType";
const TOKEN_EXPIRY_KEY = "boisheba.auth.tokenExpiry";
const REFRESH_TOKEN_KEY = "boisheba.auth.refreshToken";
const USER_STORAGE_KEY = "boisheba.auth.user";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

interface ApiFetchOptions extends RequestInit {
  method?: ApiMethod;
  requiresAuth?: boolean;
}

const isBrowser = () => typeof window !== "undefined";

// ---------------------------
// Types
// ---------------------------

export interface Book {
  id: string;
  title: string;
  author: string;
  edition?: string;
  publisher?: string;
  isbn?: string;
  description?: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  dailyRate: number;
  deposit: number;
  condition: string;
  conditionScore: number;
  fingerprint: string;
  available: boolean;
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

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
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
  const { requiresAuth = false, headers, method = "GET", body, ...rest } = options;

  const finalHeaders = new Headers(headers ?? undefined);

  if (body && !finalHeaders.has("Content-Type") && !isFormData(body)) {
    finalHeaders.set("Content-Type", "application/json");
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

  const response = await fetch(buildUrl(path), {
    method,
    body,
    headers: finalHeaders,
    ...rest,
  });

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
// Books API
// ---------------------------

export async function getBooks(query?: string): Promise<Book[]> {
  const path = query ? `/books?q=${encodeURIComponent(query)}` : "/books";
  return apiFetch<Book[]>(path);
}

export async function getBookById(id: string): Promise<Book> {
  return apiFetch<Book>(`/books/${id}`);
}

export async function createBook(bookData: Partial<Book>): Promise<Book> {
  return apiFetch<Book>("/books", {
    method: "POST",
    body: JSON.stringify(bookData),
    requiresAuth: true,
  });
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
// ---------------------------

export async function loginUser(payload: LoginPayload): Promise<StoredAuth> {
  const response = await apiFetch<AuthResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const normalized = toStoredAuth(response);
  storeAuthSession(normalized);
  return normalized;
}

export async function registerUser(payload: RegisterPayload): Promise<StoredAuth> {
  const response = await apiFetch<AuthResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const normalized = toStoredAuth(response);
  storeAuthSession(normalized);
  return normalized;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch<unknown>("/users/me", {
    requiresAuth: true,
  });

  const user = normalizeUser(response);
  updateStoredUser(user);
  return user;
}

export async function getUser(userId: string | number): Promise<User> {
  const response = await apiFetch<unknown>(`/users/${userId}`);
  return normalizeUser(response);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiFetch<unknown>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
    requiresAuth: true,
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
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
  return apiFetch<string>("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  return apiFetch<string>("/users/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<string> {
  return apiFetch<string>("/users/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export async function verifyPhone(payload: VerifyPhonePayload): Promise<string> {
  return apiFetch<string>("/users/verify-phone", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export async function updateTrustScore(userId: string | number, score: number): Promise<string> {
  return apiFetch<string>(`/users/${userId}/trust-score?score=${score}`, {
    method: "PUT",
  });
}

export async function searchUsers(request: UserSearchRequest = {}): Promise<Page<User>> {
  const response = await apiFetch<Page<unknown>>("/users/search", {
    method: "POST",
    body: JSON.stringify(request),
    requiresAuth: true,
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
