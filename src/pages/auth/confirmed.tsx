import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

export function EmailConfirmedPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Supabase client (with detectSessionInUrl) handles the hash params automatically.
    // By the time this component mounts, the session should be established.
    // We just wait for auth to settle.
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setConfirmed(true);
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-neutral-500">Confirming your email…</p>
        </Card>
      </div>
    );
  }

  // Confirmed!
  if (isAuthenticated || confirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Email confirmed!
          </h1>
          <p className="mt-2 text-neutral-500">
            Your account is ready. Start exploring BooksWithYou.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/sessions">
              <Button size="lg" className="w-full">Browse Sessions</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" className="w-full">Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Not confirmed yet — might be a direct visit, or the hash hasn't been processed
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Spinner className="text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">
          Confirming your email…
        </h1>
        <p className="mt-2 text-neutral-500">
          If you clicked the link in your email, hang tight — we're finishing up.
        </p>
        <p className="mt-4 text-sm text-neutral-400">
          If nothing happens, try{" "}
          <Link to="/login" className="text-primary-600 hover:underline">
            signing in
          </Link>
        </p>
      </Card>
    </div>
  );
}
