import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/bookwithyou/#/reset-password`,
      }
    );

    if (resetError) {
      if (resetError.message?.includes("rate")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              If an account exists for{" "}
              <span className="font-medium text-neutral-700 dark:text-gray-300">{email}</span>,
              we&apos;ve sent a password reset link.
            </p>
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
                Forgot your password?
              </h1>
              <p className="mt-2 text-neutral-500 dark:text-gray-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
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

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full mt-2"
                disabled={!email.trim()}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500 dark:text-gray-400">
              <Link
                to="/login"
                className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
              >
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
