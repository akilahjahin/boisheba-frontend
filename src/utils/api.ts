/**
 * API Client for BoiSheba
 *
 * TODO: For production, replace MSW mocks with real backend endpoints
 * Set VITE_API_BASE_URL in .env to point to Spring Boot backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
  reputation: number;
  avatar?: string;
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
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalCost: number;
  deposit: number;
}

// Books API
export async function getBooks(query?: string): Promise<Book[]> {
  const url = query ? `${API_BASE}/books?q=${encodeURIComponent(query)}` : `${API_BASE}/books`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function getBookById(id: string): Promise<Book> {
  const response = await fetch(`${API_BASE}/books/${id}`);
  if (!response.ok) throw new Error('Book not found');
  return response.json();
}

export async function createBook(bookData: Partial<Book>): Promise<Book> {
  // TODO: In production, send multipart/form-data with image files
  const response = await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  if (!response.ok) throw new Error('Failed to create book');
  return response.json();
}

export async function compareBookCondition(
  bookId: string,
  currentImage: string
): Promise<{ similarity: number; differences: string[] }> {
  // TODO: In production, send image to backend for AI comparison
  const response = await fetch(`${API_BASE}/books/${bookId}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentImage }),
  });
  if (!response.ok) throw new Error('Comparison failed');
  return response.json();
}

// Auth API
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) throw new Error('Signup failed');
  return response.json();
}

// Transactions API
export async function createBorrowRequest(request: BorrowRequest): Promise<Transaction> {
  // TODO: In production, this will initiate blockchain escrow
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Borrow request failed');
  return response.json();
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions/my`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

// Recommendations API
export async function getRecommendations(userId: string): Promise<Book[]> {
  // TODO: In production, backend will use ML for personalized recommendations
  const response = await fetch(`${API_BASE}/recommendations?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
}