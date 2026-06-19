import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        404 — Page not found
      </h1>
      <p className="text-neutral-500 mb-8 max-w-sm">
        This page doesn&apos;t exist. Maybe it was moved, or maybe you took a
        wrong turn in the library.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to Home</Button>
      </Link>
    </div>
  );
}
