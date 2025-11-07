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
│   ├── BookDetail.tsx
│   └── Admin.tsx    # Admin dashboard
├── components/      # Reusable UI components
│   ├── ui/         # shadcn/ui components
│   ├── Header.tsx   # Navigation header
│   ├── NavLink.tsx  # Navigation links
│   ├── BookCard.tsx  # Book display card
│   ├── BorrowModal.tsx  # Borrow book modal
│   ├── CompareCanvas.tsx  # Image comparison
│   └── UploadImage.tsx  # Image upload
├── lib/            # Utilities
│   ├── i18n.ts      # Internationalization
│   ├── tesseract.ts  # OCR processing
│   └── utils.ts      # API utilities
├── mocks/          # Mock API
│   ├── browser.ts    # MSW browser setup
│   ├── handlers.ts   # Mock API handlers
│   └── seed.json    # Mock data
└── public/          # Static assets
    ├── boisheba.png  # BoiSheba logo
    ├── img_1.jpg..img_6.jpg  # Hero carousel images
    ├── mockServiceWorker.js  # MSW worker
    └── favicon.ico
```

## 🎨 Features

### Implemented (Demo-Ready)
- ✅ **Landing Page**: Hero section with sliding images and feature highlights
- ✅ **User Authentication**: Login/signup flows with proper state management
- ✅ **Book Management**: Add books with image upload and OCR processing
- ✅ **Book Discovery**: Browse books with search and filtering
- ✅ **Book Details**: View complete book information with condition scoring
- ✅ **Borrowing System**: Date selection, deposit calculation, transaction creation
- ✅ **User Dashboard**: Personal stats, book management, recommendations
- ✅ **Admin Dashboard**: User management, book approval, transaction oversight
- ✅ **Image Comparison**: Before/after upload with visual diff results
- ✅ **Responsive Design**: Mobile-first with proper breakpoints
- ✅ **Component Library**: Complete shadcn/ui integration
- ✅ **TypeScript**: Full type safety throughout
- ✅ **Mock API**: MSW with all required endpoints

### TODO (Backend Integration Required)
- [ ] Real OCR with Tesseract.js or backend API
- [ ] Blockchain escrow integration
- [ ] Payment processing
- [ ] Real-time notifications
- [ ] Bengali language support (i18n)
- [ ] Advanced search & recommendations
- [ ] End-to-end tests (Cypress/Playwright)

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Routing**: React Router 6
- **Forms**: React Hook Form + Zod (coming soon)
- **State**: React Query / Zustand (coming soon)
- **OCR**: Tesseract.js (client-side, coming soon)

### Backend (Mock)
- **API**: Mock Service Worker (MSW)
- **Data**: JSON seed with 40 books including Bengali titles

## 📊 Mock Data

The application includes a comprehensive mock dataset with:
- 40 books (including 20 Bengali titles)
- 4 users (including admin)
- 3 transactions
- Complete user profiles and book metadata

## 🔌 API

### Mock Endpoints
All frontend functionality is supported by mock API endpoints:

```javascript
// Authentication
POST /api/auth/login
POST /api/auth/signup

// Books
GET /api/books
GET /api/books/:id
POST /api/books
POST /api/books/:id/compare

// Transactions
POST /api/borrow
GET /api/transactions/my

// Admin
GET /api/admin/users
PATCH /api/admin/users/:id
GET /api/admin/transactions
PATCH /api/admin/transactions/:id

// Recommendations
GET /api/recommendations
```

## 🧪 Testing & Demo

### Demo Script
**Step-by-Step Demo Flow:**
1. **Landing Page** → Click "Get Started"
2. **Sign Up** → Create account with mock credentials
3. **Add Book** → Upload book image → Watch OCR processing (simulated)
4. **Browse Books** → Search/filter books → Select a book
5. **Book Details** → View book info → Check condition score
6. **Borrow Book** → Select dates → See deposit calculation → Confirm borrow
7. **Dashboard** → View personal stats → Manage books → See recommendations
8. **Admin Panel** → Login as admin → Manage users → Approve transactions

### Recording Phase 2 Video
**Recommended Recording Script:**
- **Introduction (0:30)**: Show BoiSheba logo and tagline
- **Feature Walkthrough (1:00)**: Demonstrate key features
  - AI-powered OCR
  - Smart recommendations
  - Secure lending with blockchain
  - Bengali book collection
- **User Flow Demo (2:00)**: Show complete user journey
  - Registration and login
  - Adding a book with OCR
  - Borrowing a book
- **Admin Demo (3:00)**: Show administrative capabilities
  - User management
  - Book approval workflow
  - Transaction oversight
- **Mobile Demo (3:30)**: Show responsive design
  - Test on mobile viewport
  - Demonstrate touch interactions
- **Conclusion (4:00)**: Call to action
  - Join the book-sharing community
  - Visit GitHub repository

## 🚢 Deployment

### Development Deployment
The project runs successfully in development mode with full mock API functionality. For production deployment, consider:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect GitHub repository for automatic deployments
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🤝 Contributing

This is a hackathon project. For production use:
1. Implement real backend integration
2. Add comprehensive error handling
3. Add form validation with Zod
4. Implement real OCR with Tesseract.js
5. Add end-to-end tests (Cypress/Playwright)
6. Set up proper authentication (JWT/OAuth)
7. Implement real-time notifications

## 📄 License

MIT - Solvio AI Hackathon Demo Project Frontend

---

**Note**: This is a frontend-only demo with comprehensive mock APIs. All AI features (OCR, condition scoring) and blockchain integration are simulated for the hackathon demonstration.