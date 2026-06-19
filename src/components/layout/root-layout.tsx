import { Outlet } from "react-router-dom";
import { SkipLink } from "../ui/skip-link";
import { NavBar } from "./nav-bar";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <NavBar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <footer
        className="py-8 text-center text-sm text-neutral-400 border-t border-neutral-200/60"
        role="contentinfo"
      >
        BooksWithYou — read together
      </footer>
    </div>
  );
}
