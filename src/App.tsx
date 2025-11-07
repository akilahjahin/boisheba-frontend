// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AddBook from "./pages/AddBook";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import { worker } from "./mocks/browser";

const queryClient = new QueryClient();

const App = () => {
  // Start MSW worker only in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      worker.start()
        .then(() => console.log("Mock Service Worker enabled"))
        .catch((error) =>
          console.error("Failed to start Mock Service Worker:", error)
        );
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} />

            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/login"
                  element={
                    <Login
                      setIsLoggedIn={setIsLoggedIn}
                      setIsAdmin={setIsAdmin}
                    />
                  }
                />
                <Route
                  path="/signup"
                  element={<Signup setIsLoggedIn={setIsLoggedIn} />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
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
