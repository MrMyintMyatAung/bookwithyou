import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

export function EmailConfirmedPage() {
  const { isAuthenticated } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase appends #access_token=...&refresh_token=...&type=signup
    // to the redirect URL. With HashRouter, window.location.hash
    // looks like: #/confirmed#access_token=xxx&refresh_token=yyy&type=signup
    // We need to extract the tokens from the double-hash.
    const hash = window.location.hash;

    // Parse the second hash segment (after the first #)
    // Window location hash for HashRouter route with Supabase callback:
    // #/confirmed#access_token=... or #/reset-password#access_token=...
    const secondHashIdx = hash.indexOf("#", 1);
    const tokenPart = secondHashIdx !== -1 ? hash.substring(secondHashIdx + 1) : "";

    if (tokenPart) {
      const params = new URLSearchParams(tokenPart);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken) {
        // Handle password recovery
        if (type === "recovery") {
          // The reset-password page will handle this
          setProcessing(false);
          return;
        }

        // Set the session from the tokens
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ error: sessionError }) => {
            if (sessionError) {
              console.error("Session setup error:", sessionError);
              setError(sessionError.message);
            }
            setProcessing(false);
          });
        return;
      }
    }

    // If we arrive here and detectSessionInUrl already handled it,
    // the auth state will update via the useAuth hook.
    // Just wait a moment for auth to settle.
    const timeout = setTimeout(() => {
      setProcessing(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Still processing
  if (processing && !isAuthenticated && !error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Spinner className="mx-auto mb-4 h-8 w-8" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">
            Confirming your email…
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">
            Hang tight — we're finishing up.
          </p>
        </Card>
      </div>
    );
  }

  // Error
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">{error}</p>
          <p className="mt-4 text-sm text-neutral-400 dark:text-gray-500">
            Try{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
              signing in
            </Link>{" "}
            instead.
          </p>
        </Card>
      </div>
    );
  }

  // Confirmed!
  if (isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
            Email confirmed!
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">
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

  // Not authenticated yet — might be a direct visit without tokens
  // Show a prompt to sign in
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-brand-50 dark:bg-brand-950/40 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">
          Email confirmation
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">
          If you just confirmed your email, try signing in now.
        </p>
        <div className="mt-4">
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
