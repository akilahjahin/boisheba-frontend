// src/components/Header.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Moon, Sun } from "lucide-react";
import { User } from "@/utils/api";

interface HeaderProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  user?: User | null;
  onLogout?: () => void;
}

export default function Header({
  isLoggedIn = false,
  isAdmin = false,
  user = null,
  onLogout,
}: HeaderProps) {
  const { language } = useI18n();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const navigation = [
    { name: language === "en" ? "Home" : "হোম", href: "/" },
    { name: language === "en" ? "Books" : "বই", href: "/books" },
    ...(isLoggedIn ? [
      { name: language === "en" ? "Dashboard" : "ড্যাশবোর্ড", href: "/dashboard" },
      { name: language === "en" ? "Profile" : "প্রোফাইল", href: "/profile" },
      ...(isAdmin ? [{ name: language === "en" ? "Admin" : "অ্যাডমিন", href: "/admin" }] : [])
    ] : [])
  ];

  const authButtons = isLoggedIn ? (
    <div className="flex items-center gap-2">
      {user?.name && (
        <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
          {language === "en" ? `Hi, ${user.name.split(" ")[0]}` : user.name}
        </span>
      )}
      <Button variant="outline" onClick={() => onLogout?.()}>
        {language === "en" ? "Logout" : "লগআউট"}
      </Button>
    </div>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <NavLink to="/login">
          {language === "en" ? "Login" : "লগইন"}
        </NavLink>
      </Button>
      <Button asChild>
        <NavLink to="/signup">
          {language === "en" ? "Sign Up" : "নিবন্ধন করুন"}
        </NavLink>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-2">
          <img
            src="/boisheba.png"
            alt="Boisheba Logo"
            className="h-8 w-8"
          />
          <span className="font-bold text-xl text-primary">BoiSheba</span>
        </NavLink>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-6">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
                activeClassName="text-primary"
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Auth Buttons - Desktop */}
          {!isMobile && authButtons}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="border-t bg-background px-4 py-2">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                activeClassName="text-primary bg-muted rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <div className="flex flex-col space-y-2 pt-2 border-t mt-2">
              {authButtons}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}