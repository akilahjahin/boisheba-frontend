// src/components/NavLink.tsx
import { Link, useLocation } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const navLinkVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-primary",
        ghost: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  }
);

export interface NavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navLinkVariants> {
  to: string;
  activeClassName?: string;
  showLogo?: boolean;
}

// Add named export alongside default export
const NavLinkComponent = ({
  className,
  to,
  variant,
  activeClassName,
  showLogo = false,
  children,
  ...props
}: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        navLinkVariants({ variant }),
        isActive && activeClassName,
        className
      )}
      {...props}
    >
      {showLogo && (
        <img
          src="/boisheba.png"
          alt="Boisheba Logo"
          className="w-4 h-4 rounded-full mr-2"
        />
      )}
      {children}
    </Link>
  );
};

// Export both default and named
export default NavLinkComponent;
export { NavLinkComponent as NavLink };