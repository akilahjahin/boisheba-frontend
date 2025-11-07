// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AddBook from "./pages/AddBook";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { worker } from "./mocks/browser";
import {
  clearAuthSession,
  getCurrentUser,
  getStoredAuth,
  StoredAuth,
  User,
  storeAuthSession,
} from "@/utils/api";

const queryClient = new QueryClient();

const shouldUseMocks = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return false;
  }
  return process.env.NODE_ENV === "development";
};

const isAdminUser = (user?: User | null) => {
  if (!user) return false;
  if (typeof user.isAdmin === "boolean") return user.isAdmin;
  if (Array.isArray(user.roles)) {
    return user.roles.some((role) => role.toLowerCase().includes("admin"));
  }
  return false;
};

const App = () => {
  // Start MSW worker only when no backend is configured
  useEffect(() => {
    if (shouldUseMocks()) {
      worker
        .start()
        .then(() => console.log("🔧 Mock Service Worker enabled"))
        .catch((error) =>
          console.error("Failed to start Mock Service Worker:", error)
        );
    } else {
      console.log("🚀 Using Spring Boot backend at:", import.meta.env.VITE_API_BASE_URL);
      
      // Unregister any existing service workers when using real backend
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log("✅ Service Worker unregistered");
            });
          });
        });
      }
    }
  }, []);

  const [auth, setAuth] = useState<StoredAuth | null>(() => getStoredAuth());

  const handleAuthSuccess = useCallback((nextAuth: StoredAuth) => {
    setAuth(nextAuth);
    storeAuthSession(nextAuth);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    setAuth(null);
  }, []);

  useEffect(() => {
    if (!auth?.token) return;

    let isActive = true;

    getCurrentUser()
      .then((user) => {
        if (!isActive) return;
        setAuth((prev) => {
          if (!prev) {
            const next = { token: auth.token, refreshToken: auth.refreshToken, user };
            storeAuthSession(next);
            return next;
          }
          const next = { ...prev, user };
          storeAuthSession(next);
          return next;
        });
      })
      .catch((error) => {
        console.error("Failed to refresh user profile", error);
        if (!isActive) return;
        handleLogout();
      });

    return () => {
      isActive = false;
    };
  }, [auth?.token, auth?.refreshToken, handleLogout]);

  const isLoggedIn = Boolean(auth);
  const adminFlag = isAdminUser(auth?.user);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header
              isLoggedIn={isLoggedIn}
              isAdmin={adminFlag}
              user={auth?.user ?? null}
              onLogout={handleLogout}
            />

            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/login"
                  element={
                    <Login onAuthSuccess={handleAuthSuccess} />
                  }
                />
                <Route
                  path="/signup"
                  element={<Signup onAuthSuccess={handleAuthSuccess} />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
