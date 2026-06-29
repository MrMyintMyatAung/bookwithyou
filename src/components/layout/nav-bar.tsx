import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { SignOutButton } from "../auth/sign-out-button";

/* ─── Theme toggle icon ─── */
function ThemeIcon({ mode }: { mode: "light" | "dark" | "system" }) {
  if (mode === "light") {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    );
  }
  // system
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export function NavBar() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const { mode, toggle } = useTheme();
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
    <header className="relative z-50">
      <nav
        className="px-6 py-3 flex items-center justify-between gap-3 w-full backdrop-blur-xl bg-white/70 dark:bg-[#18161a]/70 border border-slate-300/70 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-none"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline shrink-0"
        >
          {/* App icon */}
          <span className="relative size-[30px] rounded-lg overflow-hidden shrink-0">
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0891b2 0%, #0e7490 35%, #155e75 65%, #06b6d4 100%)",
              }}
            />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            <span className="text-slate-900 dark:text-white">Books</span>
            <span className="text-coral-400">With</span>
            <span className="text-slate-900 dark:text-white">You</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            to="/sessions"
            className="text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
            style={{ letterSpacing: "-0.02em" }}
          >
            Sessions
          </Link>
          {isLoading ? (
            <div className="h-7 w-16 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
                style={{ letterSpacing: "-0.02em" }}
              >
                {profile?.username ?? "Reader"}
              </Link>
              <SignOutButton className="!text-slate-500 dark:!text-white/60 hover:!text-slate-900 dark:hover:!text-white hover:!bg-slate-100 dark:hover:!bg-white/10" />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
                style={{ letterSpacing: "-0.02em" }}
              >
                Sign In
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            className="p-1.5 rounded-lg text-slate-400 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label={`Theme: ${mode}. Click to change.`}
            title={`Theme: ${mode}`}
          >
            <ThemeIcon mode={mode} />
          </button>
        </div>

        {/* Right side: CTA + mobile controls */}
        <div className="flex items-center gap-2">
          {/* CTA button — desktop */}
          {!isAuthenticated && (
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-semibold text-white no-underline shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110 active:scale-[0.97] transition-all duration-200"
              style={{ letterSpacing: "-0.02em" }}
            >
              Get Started
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/sessions/new"
              className="hidden sm:inline-flex items-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-semibold text-white no-underline shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110 active:scale-[0.97] transition-all duration-200"
              style={{ letterSpacing: "-0.02em" }}
            >
              New Session
            </Link>
          )}

          {/* Mobile hamburger + theme toggle */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-md text-slate-400 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label={`Theme: ${mode}`}
            >
              <ThemeIcon mode={mode} />
            </button>
            <button
              type="button"
              className="p-2 rounded-md text-slate-400 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
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
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="sm:hidden absolute top-full left-0 right-0 z-40"
        >
          <div className="w-full bg-white dark:bg-[#0f0f14] border-b border-slate-200 dark:border-white/10 shadow-lg overflow-hidden backdrop-blur-xl">
            <div className="px-5 py-4 flex flex-col gap-1">
              <Link
                to="/sessions"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-white/60 no-underline hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              >
                Sessions
              </Link>
              {isLoading ? (
                <div className="h-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse mx-3" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-white/60 no-underline hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  >
                    {profile?.username ?? "Reader"}
                  </Link>
                  <Link
                    to="/sessions/new"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-white/60 no-underline hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  >
                    New Session
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
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-white/60 no-underline hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-coral-500 no-underline hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
