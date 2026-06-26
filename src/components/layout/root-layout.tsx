import { Link, Outlet } from "react-router-dom";
import { SkipLink } from "../ui/skip-link";
import { NavBar } from "./nav-bar";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950">
      <SkipLink />
      <NavBar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <footer
        className="bg-navy-900 dark:bg-gray-950 text-navy-300 dark:text-gray-400 py-16"
        role="contentinfo"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link
                to="/"
                className="text-lg font-black tracking-tight text-white no-underline"
              >
                <span>Books</span>
                <span className="text-coral-400">With</span>
                <span>You</span>
              </Link>
              <p className="mt-3 text-sm text-navy-400 leading-relaxed">
                Read together, share progress, discuss books.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/sessions" className="text-sm text-navy-400 hover:text-white transition-colors no-underline">
                    Browse Sessions
                  </Link>
                </li>
                <li>
                  <Link to="/sessions/new" className="text-sm text-navy-400 hover:text-white transition-colors no-underline">
                    Start a Session
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-navy-400 hover:text-white transition-colors no-underline">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-navy-800 text-center text-sm text-navy-500">
            &copy; {new Date().getFullYear()} BooksWithYou. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
