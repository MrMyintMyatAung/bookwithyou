import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SkipLink } from "../ui/skip-link";
import { NavBar } from "./nav-bar";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/confirmed"];

export function RootLayout() {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Force dark mode on auth pages — the glassmorphism design only works on dark backgrounds
  useEffect(() => {
    if (!isAuthPage) return;
    const hadDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");
    return () => {
      if (!hadDark) {
        document.documentElement.classList.remove("dark");
      }
    };
  }, [isAuthPage]);

  return (
    <div className={`min-h-screen flex flex-col ${isAuthPage ? "bg-[#18161a]" : "bg-[#faf8f5] dark:bg-[#18161a]"}`}>
      <SkipLink />
      <NavBar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      {!isAuthPage && <footer
        className="relative overflow-hidden bg-[#faf8f5] dark:bg-[#18161a] text-slate-400 dark:text-white/50"
        role="contentinfo"
      >
        {/* Subtle top gradient edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coral-500/30 to-transparent" />

        {/* Soft ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-coral-500/[0.04] rounded-full blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-8 mb-14">
            {/* Brand */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-white no-underline"
              >
                <span className="relative size-7 rounded-lg overflow-hidden ring-1 ring-slate-300 dark:ring-white/15 shrink-0">
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #0891b2 0%, #0e7490 35%, #155e75 65%, #06b6d4 100%)",
                    }}
                  />
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
                </span>
                <span>Books</span>
                <span className="text-coral-400">With</span>
                <span>You</span>
              </Link>
              <p className="mt-4 text-sm text-slate-400 dark:text-white/40 leading-relaxed max-w-xs">
                Read together, share progress, discuss books.
              </p>
            </div>

            {/* Product */}
            <div className="sm:text-right">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400/60 dark:text-white/30 mb-4">
                Product
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/sessions" className="group inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
                    <span className="inline-block w-0 group-hover:w-2 h-px bg-coral-400 transition-all duration-200" />
                    Browse Sessions
                  </Link>
                </li>
                <li>
                  <Link to="/sessions/new" className="group inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
                    <span className="inline-block w-0 group-hover:w-2 h-px bg-coral-400 transition-all duration-200" />
                    Start a Session
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="group inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
                    <span className="inline-block w-0 group-hover:w-2 h-px bg-coral-400 transition-all duration-200" />
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400/60 dark:text-white/30">
            <span>&copy; {new Date().getFullYear()} BooksWithYou. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All systems normal</span>
            </div>
          </div>
        </div>
      </footer>}
    </div>
  );
}
