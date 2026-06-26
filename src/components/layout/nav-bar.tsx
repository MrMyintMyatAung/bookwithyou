import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SignOutButton } from "../auth/sign-out-button";

export function NavBar() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-navy-800/70 border-b border-white/10">
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight text-white no-underline hover:text-white/90 transition-colors"
        >
          <span>Books</span>
          <span className="text-coral-400">With</span>
          <span>You</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            to="/sessions"
            className="text-sm font-medium text-navy-200 hover:text-white transition-colors no-underline"
          >
            Sessions
          </Link>
          {isLoading ? (
            <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-sm font-medium text-navy-200 hover:text-white transition-colors no-underline"
              >
                {profile?.username ?? "Reader"}
              </Link>
              <SignOutButton className="!text-navy-200 hover:!text-white hover:!bg-white/10" />
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-navy-200 hover:text-white transition-colors no-underline"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg bg-coral-500 px-4 py-1.5 text-sm font-bold text-white no-underline hover:bg-coral-600 transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden p-2 rounded-md text-navy-200 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="sm:hidden border-t border-white/10"
        >
          <div className="mx-auto max-w-6xl px-5 py-4 flex flex-col gap-1">
            <Link
              to="/sessions"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-navy-200 no-underline hover:bg-white/5 hover:text-white"
            >
              Sessions
            </Link>
            {isLoading ? (
              <div className="h-8 bg-white/5 rounded-lg animate-pulse mx-3" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-navy-200 no-underline hover:bg-white/5 hover:text-white"
                >
                  {profile?.username ?? "Reader"}
                </Link>
                <div className="px-3 py-1">
                  <SignOutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-navy-200 no-underline hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-bold text-coral-400 no-underline hover:bg-white/5"
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
