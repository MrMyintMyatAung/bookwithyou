import { useState, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function LoginForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingTo, setResendingTo] = useState("");

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (
        authError.message?.includes("Email not confirmed") ||
        authError.message?.includes("email_not_confirmed")
      ) {
        setError("");
        setResendingTo(email);
        setLoading(false);
        return;
      }

      if (authError.status === 400) {
        setError("Invalid email or password. Please try again.");
      } else if (authError.message?.includes("rate")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(authError.message || "Something went wrong. Please try again.");
      }
      setLoading(false);
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: resendingTo,
      options: {
        emailRedirectTo: `${window.location.origin}/bookwithyou/#/confirmed`,
      },
    });

    if (resendError) {
      setError(resendError.message || "Failed to resend. Please try again.");
      setResendingTo("");
    } else {
      setError("");
      // Show success for a moment then reset
      setResendingTo(`sent:${resendingTo}`);
      setLoading(false);
    }
  };

  // Show "email not confirmed" prompt
  if (resendingTo && !resendingTo.startsWith("sent:")) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
              Email not confirmed
            </h1>
            <p className="mt-2 text-neutral-500 dark:text-gray-400">
              You need to confirm your email before signing in.
              The confirmation link was sent to{" "}
              <span className="font-medium text-neutral-700 dark:text-gray-300">{resendingTo}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResendConfirmation}
              loading={loading}
              size="lg"
              className="w-full"
            >
              Resend Confirmation Email
            </Button>
            <button
              type="button"
              onClick={() => setResendingTo("")}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Show "email sent" confirmation
  if (resendingTo.startsWith("sent:")) {
    const sentEmail = resendingTo.replace("sent:", "");
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">Confirmation email sent!</h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">
            Check <span className="font-medium">{sentEmail}</span> and click the link to confirm.
          </p>
          <button
            type="button"
            onClick={() => setResendingTo("")}
            className="mt-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Back to Sign In
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">Welcome back</h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {resetSuccess && (
            <div
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 dark:text-emerald-300"
              role="alert"
            >
              Password updated successfully! Sign in with your new password.
            </div>
          )}

          {error && (
            <div
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-neutral-500 hover:text-primary-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
