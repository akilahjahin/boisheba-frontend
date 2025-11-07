import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Add semantic text colors
        'text-default': {
          DEFAULT: 'hsl(var(--foreground))',
          dark: 'hsl(var(--muted-foreground))',
        },
        'text-subtle': {
          DEFAULT: 'hsl(var(--muted-foreground))',
          dark: 'hsl(var(--muted-foreground))',
        },
        'text-emphasis': {
          DEFAULT: 'hsl(var(--primary))',
          dark: 'hsl(var(--primary))',
        },
        'text-inverse': {
          DEFAULT: 'hsl(0 0% 100%)',
          dark: 'hsl(0 0% 100%)',
        },
        // Custom Boisheba Green Palette - Darker and Classy
        boisheba: {
          50: "#f6fbf6",
          100: "#e8f5e8",
          200: "#d4ead4",
          300: "#b8d9b8",
          400: "#5dbb63", // Lighter green
          500: "#3cb043", // Primary green
          600: "#03ac13", // Darker green
          700: "#028a0f", // Even darker green
          800: "#234f1e", // Dark green
          900: "#1a3a17", // Darkest green
          950: "#0d1d0b", // Almost black with green tint
        },
        // Additional semantic colors for book-specific states
        book: {
          available: "#3cb043", // Same as boisheba-500
          borrowed: "#f59e0b", // Amber for borrowed state
          reserved: "#3b82f6", // Blue for reserved state
          damaged: "#ef4444", // Red for damaged state
        }
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #f6fbf6 0%, #e8f5e8 50%, #d4ead4 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f6fbf6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a3a17 0%, #234f1e 50%, #028a0f 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(60, 176, 67, 0.1), 0 4px 6px -2px rgba(60, 176, 67, 0.05)',
        'medium': '0 4px 25px -5px rgba(60, 176, 67, 0.15), 0 10px 10px -5px rgba(60, 176, 67, 0.04)',
        'large': '0 10px 40px -10px rgba(60, 176, 67, 0.2), 0 20px 25px -5px rgba(60, 176, 67, 0.1)',
        'green-glow': '0 0 20px rgba(60, 176, 67, 0.3)',
      },
      transitionProperty: {
        'base': 'all',
        'smooth': 'transform, opacity, box-shadow',
      },
      transitionDuration: {
        'smooth': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(60, 176, 67, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(60, 176, 67, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-green": "pulse-green 2s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;