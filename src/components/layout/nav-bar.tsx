import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SignOutButton } from "../auth/sign-out-button";

export function NavBar() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-neutral-900 hover:text-primary-700 transition-colors"
        >
          📚 BooksWithYou
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/sessions">
            <span className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors">
              Sessions
            </span>
          </Link>
          {isLoading ? (
            <div className="h-8 w-20 bg-neutral-200 rounded-lg animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                {profile?.username ?? "Reader"}
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link to="/login">
                <span className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors">
                  Sign In
                </span>
              </Link>
              <Link to="/register">
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm">
                  Join
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="sm:hidden border-t border-neutral-200 bg-white"
        >
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              to="/sessions"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 py-1"
            >
              Sessions
            </Link>
            {isLoading ? (
              <div className="h-8 bg-neutral-200 rounded-lg animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 py-1"
                >
                  {profile?.username ?? "Reader"}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-neutral-700 hover:text-neutral-900 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Join BooksWithYou
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
