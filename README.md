# BoiSheba - AI-Enabled Book Sharing Platform

BoiSheba is a community-driven book-sharing platform that uses AI to streamline book lending. Upload a book photo, and our AI extracts metadata and assesses condition. Borrow books with blockchain-secured deposits.

**Demo Project for SOLVIO AI Hackathon 2025 by Sheba Platform, Bangladesh**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with ES6 support

### Installation

```bash
# Install dependencies
npm install

# Initialize MSW (first time only)
npx msw init public/

# Start development server (with MSW mock API)
npm run dev
```

The app will run at `http://localhost:8080` with mock API enabled by default.

## 📁 Project Structure

```
src/
├── pages/           # Page components
│   ├── Index.tsx    # Landing page
│   ├── Login.tsx    # Authentication
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── AddBook.tsx  # Book upload with OCR
│   ├── Books.tsx    # Browse books
│   └── BookDetail.tsx
├── components/      # Reusable UI components
├── lib/            # Utilities
└── index.css       # Design system tokens
```

## 🎨 Features

### Implemented (Demo-Ready)
- ✅ Landing page with hero section
- ✅ User authentication (mocked)
- ✅ Book upload with image preview
- ✅ Book listing with search
- ✅ Book detail page with AI condition score
- ✅ Borrow flow with date selection
- ✅ User dashboard with stats
- ✅ Responsive, mobile-first design
- ✅ Design system with Tailwind tokens

### TODO (Backend Integration Required)
- [ ] Real OCR with Tesseract.js or backend API
- [ ] Blockchain escrow integration
- [ ] Payment processing
- [ ] Real-time notifications
- [ ] Bengali language support (i18n)
- [ ] Admin panel
- [ ] Advanced search & recommendations

## 🔌 Backend Integration

### Mock API Setup (Coming Soon)
The frontend is designed to work with a separate Spring Boot backend. Mock endpoints are currently simulated with `setTimeout` for the hackathon demo.

### API Contract (Expected Endpoints)

```yaml
# OpenAPI 3.0 specification coming soon
POST /api/auth/signup
POST /api/auth/login
POST /api/books - Create book
GET /api/books - List books
GET /api/books/:id - Get book details
POST /api/books/ocr - OCR image processing
POST /api/borrow - Create borrow request
GET /api/users/me - Get current user
```

### Switching to Real Backend

1. Create `.env.local`:
```env
VITE_API_BASE_URL=http://your-backend-url:8080/api
```

2. Update fetch calls in components to use `import.meta.env.VITE_API_BASE_URL`

## 🧪 Testing & Demo

### Demo Script
1. Visit landing page → Click "Get Started"
2. Sign up with mock credentials
3. Navigate to "Add Book" → Upload book image
4. Watch OCR extract metadata (simulated)
5. Browse books → Select a book
6. Choose borrow dates → See deposit calculation
7. View dashboard with stats

### Recording Phase 2 Video
- Use screen recording tool (OBS, Loom, etc.)
- Follow demo script above
- Highlight AI features (OCR, condition scoring)
- Show responsive design on mobile viewport

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Build
```bash
npm run build
# Serve dist/ folder with any static host
```

### GitHub Actions (CI/CD)
Coming soon - automated testing and deployment

## 🎯 Hackathon Deliverables

- [x] Complete frontend repository
- [x] Responsive UI with Tailwind
- [x] Mock authentication flow
- [x] Book upload with OCR placeholder
- [x] Borrow flow with escrow placeholder
- [ ] Mock API server (JSON Server or MSW)
- [ ] API documentation (OpenAPI spec)
- [ ] Deployment instructions
- [ ] Demo video script

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Routing**: React Router 6
- **Forms**: React Hook Form + Zod (coming soon)
- **State**: React Query / Zustand (coming soon)
- **OCR**: Tesseract.js (client-side, coming soon)
- **Deployment**: Vercel

## 📝 Notes

- **Backend**: This is frontend-only. Backend APIs are mocked for demo.
- **AI Features**: OCR and condition detection are simulated but have clear integration points.
- **i18n**: Bengali support structure is planned but not yet implemented.
- **Testing**: Cypress/Playwright tests coming soon.

## 🤝 Contributing

This is a hackathon project. For production use:
1. Implement real backend integration
2. Add comprehensive error handling
3. Add form validation with Zod
4. Implement real OCR with Tesseract.js
5. Add end-to-end tests
6. Set up proper authentication (JWT/OAuth)

## 📄 License

MIT - Solvio AI Hackathon Demo Project Frontend

---