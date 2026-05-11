import { Link, NavLink } from "react-router-dom";
import { Lock, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Início" },
    { to: "/instituicoes", label: "Instituições" },
    { to: "/sobre", label: "Sobre" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-0 font-display text-xl font-bold">
          <span style={{ color: "#1B3A8C" }}>Apoia</span>
          <span style={{ color: "#008B8B" }}>SUS</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-smooth hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/login">
              <Lock className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-smooth ${
                    isActive ? "bg-secondary text-primary" : "text-muted-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;