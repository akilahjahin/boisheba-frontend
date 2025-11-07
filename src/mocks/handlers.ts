// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import seedData from './seed.json';

const API_BASE = '/api';

// Helper function to safely get array data
const getSafeArray = (data: any) => {
  return Array.isArray(data) ? data : [];
};

// In-memory data store (mutates during session)
let books = [...seedData.books];
let users = getSafeArray(seedData.users);
let transactions = getSafeArray(seedData.transactions);

// Mock current user (set after login)
let currentUser: typeof users[0] | null = users[0]; // Default logged in as user1

// Export handlers as an array of RequestHandler
export const handlers = [
  // GET /books - List all books with optional search
  http.get(`${API_BASE}/books`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase();

    let filtered = books;
    if (query) {
      filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }

    return HttpResponse.json(filtered);
  }),

  // GET /books/:id - Get single book
  http.get(`${API_BASE}/books/:id`, ({ params }) => {
    const book = books.find((b) => b.id === params.id);
    if (!book) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(book);
  }),

  // POST /books - Create new book
  http.post(`${API_BASE}/books`, async ({ request }) => {
    const body = await request.json() as any;

    const newBook = {
      id: `book-${Date.now()}`,
      title: body.title,
      author: body.author,
      edition: body.edition || '',
      publisher: body.publisher || '',
      isbn: body.isbn || '',
      description: body.description || '',
      images: body.images || [],
      ownerId: currentUser?.id || 'user1',
      ownerName: currentUser?.name || 'Unknown',
      dailyRate: body.dailyRate || 30,
      deposit: body.deposit || 300,
      condition: body.condition || 'Good',
      conditionScore: body.conditionScore || 85,
      fingerprint: `hash-${Date.now()}`,
      available: true,
    };

    books.push(newBook);
    return HttpResponse.json(newBook, { status: 201 });
  }),

  // POST /books/:id/compare - Compare book condition
  http.post(`${API_BASE}/books/:id/compare`, async ({ params }) => {
    const book = books.find((b) => b.id === params.id);
    if (!book) return new HttpResponse(null, { status: 404 });

    const similarity = Math.floor(Math.random() * 20) + 75; // 75-95%
    const differences = similarity < 85
      ? ['Minor edge wear detected', 'Slight color fading on spine']
      : ['No significant changes detected'];

    return HttpResponse.json({ similarity, differences });
  }),

  // POST /auth/login - Login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;

    const user = users.find((u) => u.email === body.email);
    if (!user) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    currentUser = user;
    return HttpResponse.json({
      user,
      token: `mock-token-${user.id}`,
    });
  }),

  // POST /auth/signup - Signup
  http.post(`${API_BASE}/auth/signup`, async ({ request }) => {
    const body = await request.json() as any;

    const existingUser = users.find((u) => u.email === body.email);
    if (existingUser) {
      return new HttpResponse(JSON.stringify({ error: 'Email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      reputation: 5.0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name}`,
      isActive: true,
      booksShared: 0,
      isAdmin: false,
    };

    users.push(newUser);
    currentUser = newUser;

    return HttpResponse.json({
      user: newUser,
      token: `mock-token-${newUser.id}`,
    }, { status: 201 });
  }),

  // GET /admin/users - Get all users (admin only)
  http.get(`${API_BASE}/admin/users`, () => {
    const enrichedUsers = users.map(user => ({
      ...user,
      isActive: user.isActive !== false,
      booksShared: user.booksShared ?? Math.floor(Math.random() * 10) + 1,
    }));

    return HttpResponse.json(enrichedUsers);
  }),

  // PATCH /admin/users/:id - Update user status (admin only)
  http.patch(`${API_BASE}/admin/users/:id`, async ({ params, request }) => {
    const userId = params.id;
    const body = await request.json() as any;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return new HttpResponse(null, { status: 404 });

    users[userIndex] = { ...users[userIndex], ...body };

    return HttpResponse.json(users[userIndex]);
  }),

  // GET /admin/transactions - Get all transactions (admin only)
  http.get(`${API_BASE}/admin/transactions`, () => {
    const enrichedTransactions = transactions.map(tx => ({
      ...tx,
      bookId: tx.bookId,
      borrowerId: tx.borrowerId,
    }));

    return HttpResponse.json(enrichedTransactions);
  }),

  // PATCH /admin/transactions/:id - Update transaction status (admin only)
  http.patch(`${API_BASE}/admin/transactions/:id`, async ({ params, request }) => {
    const transactionId = params.id;
    const body = await request.json() as any;

    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return new HttpResponse(null, { status: 404 });

    transactions[transactionIndex] = { ...transactions[transactionIndex], ...body };

    return HttpResponse.json(transactions[transactionIndex]);
  }),

  // POST /transactions - Create borrow request (updated)
  http.post(`${API_BASE}/transactions`, async ({ request }) => {
    const body = await request.json() as any;

    const book = books.find((b) => b.id === body.bookId);
    if (!book || !book.available) {
      return new HttpResponse(JSON.stringify({ error: 'Book not available' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transaction = {
      id: `tx-${Date.now()}`,
      bookId: body.bookId,
      borrowerId: currentUser?.id || 'user1',
      lenderId: book.ownerId,
      startDate: body.startDate,
      endDate: body.endDate,
      status: 'pending' as const,
      totalCost: body.totalCost,
      deposit: body.deposit,
    };

    transactions.push(transaction);

    // Mark book as unavailable
    const bookIndex = books.findIndex((b) => b.id === body.bookId);
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], available: false };
    }

    return HttpResponse.json(transaction, { status: 201 });
  }),

  // GET /transactions/my - Get user's transactions
  http.get(`${API_BASE}/transactions/my`, () => {
    const userTransactions = transactions.filter(
      (tx) => tx.borrowerId === currentUser?.id
    );
    return HttpResponse.json(userTransactions);
  }),

  // GET /recommendations - Get book recommendations
  http.get(`${API_BASE}/recommendations`, () => {
    const available = books.filter((b) => b.available);
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return HttpResponse.json(shuffled.slice(0, 3));
  }),
];