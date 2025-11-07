// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import seedData from './seed.json';

const API_BASE = '/api';

// Helper function to safely get array data
const getSafeArray = (data: any) => {
  return Array.isArray(data) ? data : [];
};

// In-memory data store (mutates during session)
const seed = seedData as Record<string, unknown>;

let books = [...getSafeArray(seed.books)];
let users = [...getSafeArray(seed.users)];
let transactions = [...getSafeArray(seed.transactions)];

// Mock current user (set after login)
let currentUser: typeof users[0] | null = users[0]; // Default logged in as user1

const buildAuthResponse = (user: typeof users[number]) => ({
  user,
  token: `mock-token-${user.id}`,
  refreshToken: `mock-refresh-${user.id}`,
  tokenType: 'Bearer',
  expiresIn: 3600,
});

const findUserById = (userId: string | undefined) =>
  users.find((user) => String(user.id) === String(userId));

const ensureAuthenticated = () => {
  if (!currentUser) {
    return new HttpResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
};

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

  // POST /users/register - Signup
  http.post(`${API_BASE}/users/register`, async ({ request }) => {
    const body = await request.json() as any;
    const email = (body.email as string | undefined)?.toLowerCase();

    const existingUser = users.find((u) => u.email.toLowerCase() === email);
    if (existingUser) {
      return new HttpResponse(JSON.stringify({ error: 'Email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if phone already exists
    if (body.phone) {
      const existingPhone = users.find((u) => u.phone === body.phone);
      if (existingPhone) {
        return new HttpResponse(JSON.stringify({ error: 'Phone number already registered' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const fullName = body.name || 'New User';

    const newUser = {
      id: `user-${Date.now()}`,
      name: fullName,
      email: body.email,
      phone: body.phone,
      profileImageUrl: null,
      bio: null,
      address: body.address || null,
      city: body.city || null,
      district: body.district || null,
      postalCode: body.postalCode || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      trustScore: 50.0,
      totalBooksListed: 0,
      totalBooksBorrowed: 0,
      totalBooksLent: 0,
      completedTransactions: 0,
      cancelledTransactions: 0,
      overdueTransactions: 0,
      averageRating: 0.0,
      totalRatings: 0,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: false,
      phoneVerified: false,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      reputation: 5.0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      isActive: true,
      booksShared: 0,
      isAdmin: false,
      roles: ['USER'],
    };

    users.push(newUser);
    currentUser = newUser;

    return HttpResponse.json(buildAuthResponse(newUser), { status: 201 });
  }),

  // POST /users/login - Login
  http.post(`${API_BASE}/users/login`, async ({ request }) => {
    const body = await request.json() as any;
    const query = (body.emailOrPhone as string | undefined)?.toLowerCase();

    if (!query) {
      return new HttpResponse(JSON.stringify({ error: 'Email or phone is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = users.find((u) =>
      u.email.toLowerCase() === query || (u.phone && u.phone.toLowerCase() === query)
    );

    if (!user) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    currentUser = user;
    return HttpResponse.json(buildAuthResponse(user));
  }),

  // POST /users/change-password - Change password
  http.post(`${API_BASE}/users/change-password`, async () => {
    const authError = ensureAuthenticated();
    if (authError) return authError;
    return HttpResponse.json('Password changed successfully');
  }),

  // POST /users/forgot-password - Forgot password
  http.post(`${API_BASE}/users/forgot-password`, async () => {
    return HttpResponse.json('Password reset link sent to email');
  }),

  // POST /users/reset-password - Reset password
  http.post(`${API_BASE}/users/reset-password`, async () => {
    return HttpResponse.json('Password reset successful');
  }),

  // POST /users/verify-email - Verify email
  http.post(`${API_BASE}/users/verify-email`, async () => {
    const authError = ensureAuthenticated();
    if (authError) return authError;
    return HttpResponse.json('Email verified successfully');
  }),

  // POST /users/verify-phone - Verify phone
  http.post(`${API_BASE}/users/verify-phone`, async () => {
    const authError = ensureAuthenticated();
    if (authError) return authError;
    return HttpResponse.json('Phone verified successfully');
  }),

  // GET /users/me - Current user profile
  http.get(`${API_BASE}/users/me`, () => {
    if (!currentUser) {
      return new HttpResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return HttpResponse.json(currentUser);
  }),

  // PUT /users/profile - Update profile
  http.put(`${API_BASE}/users/profile`, async ({ request }) => {
    const authError = ensureAuthenticated();
    if (authError) return authError;

    const updates = await request.json() as Record<string, unknown>;
    if (!currentUser) return authError;

    currentUser = { ...currentUser, ...updates };
    const index = users.findIndex((user) => user.id === currentUser?.id);
    if (index !== -1) {
      users[index] = currentUser;
    }

    return HttpResponse.json(currentUser);
  }),

  // GET /users/:userId - Get user by ID
  http.get(`${API_BASE}/users/:userId`, ({ params }) => {
    const user = findUserById(params.userId as string | undefined);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  // PUT /users/:userId/trust-score - Update trust score
  http.put(`${API_BASE}/users/:userId/trust-score`, async ({ params, request }) => {
    const url = new URL(request.url);
    const scoreParam = url.searchParams.get('score');
    const score = scoreParam ? Number(scoreParam) : undefined;
    const user = findUserById(params.userId as string | undefined);

    if (!user) {
      return new HttpResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    user.trustScore = typeof score === 'number' && !Number.isNaN(score) ? score : user.trustScore ?? 75;
    return HttpResponse.json('Trust score updated');
  }),

  // POST /users/search - Search users
  http.post(`${API_BASE}/users/search`, async ({ request }) => {
    const authError = ensureAuthenticated();
    if (authError) return authError;
    const body = await request.json() as Record<string, unknown>;
    const keyword = (body.keyword as string | undefined)?.toLowerCase().trim();
    const page = Number(body.page ?? 0);
    const size = Number(body.size ?? 20);

    let filtered = users;
    if (keyword) {
      filtered = users.filter((user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.phone && user.phone.toLowerCase().includes(keyword))
      );
    }

    const start = page * size;
    const paged = filtered.slice(start, start + size);

    return HttpResponse.json({
      content: paged,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      size,
      number: page,
      first: page === 0,
      last: start + size >= filtered.length,
      numberOfElements: paged.length,
      empty: paged.length === 0,
    });
  }),

  // GET /users/admin/stats - Admin stats
  http.get(`${API_BASE}/users/admin/stats`, () => {
    const authError = ensureAuthenticated();
    if (authError) return authError;
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.isActive !== false).length;
    const verifiedUsers = users.filter((user) => user.trustScore && user.trustScore >= 80).length;
    const adminUsers = users.filter((user) => user.isAdmin).length;

    return HttpResponse.json({
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
    });
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