import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

function validateUsername(username: string): string | null {
  if (!username || username.trim().length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }
  if (username.length > 30) {
    return "Username must be 30 characters or fewer.";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

export function RegisterForm() {
  const { isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    email?: string;
  }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  // If already authenticated, show profile link
  // Don't redirect — they might have just verified their email in another tab

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setFieldErrors({
        username: usernameError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }

    setFieldErrors({});
    setServerError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}#/confirmed`,
      },
    });

    if (authError) {
      if (
        authError.message?.includes("already registered") ||
        authError.message?.includes("already exists")
      ) {
        setFieldErrors({ email: "An account with this email already exists." });
      } else if (authError.message?.includes("rate")) {
        setServerError("Too many attempts. Please wait a moment and try again.");
      } else {
        setServerError(authError.message || "Something went wrong. Please try again.");
      }
      setLoading(false);
    } else {
      // Email confirmation is enabled — show success message
      setEmailSent(email);
      setLoading(false);
    }
  };

  // Show "check your email" screen
  if (emailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
              Check your email
            </h1>
            <p className="mt-2 text-neutral-500 dark:text-gray-400">
              We sent a confirmation link to{" "}
              <span className="font-medium text-neutral-700 dark:text-gray-300">{emailSent}</span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 mb-6">
            <p className="font-semibold mb-1">📬 What to do next:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Open your inbox and find the email from Supabase</li>
              <li>Click <strong>"Confirm your email address"</strong></li>
              <li>You'll be brought back here — signed in and ready to go</li>
            </ol>
            <p className="mt-3 text-amber-700 text-xs">
              Didn't get it? Check your spam folder. Still nothing? Try registering again.
            </p>
          </div>

          <Link to="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // If already fully authenticated, show a brief message
  if (isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 text-emerald-600 dark:text-emerald-400">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">You're signed in</h1>
          <p className="mt-2 text-neutral-500 mb-4">Your email has been confirmed. You're all set!</p>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-gray-400">Join BooksWithYou</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {serverError && (
            <div
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="bookworm42"
            autoComplete="username"
            error={fieldErrors.username}
            required
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            error={fieldErrors.email}
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={fieldErrors.password}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
