import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

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

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

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
      },
    });

    if (authError) {
      // Supabase signUp errors: "User already registered" means the email is taken.
      // The username uniqueness is enforced by a trigger/RLS in the profiles table
      // and would surface as a different error or as a failed profile creation.
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
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            Create your account
          </h1>
          <p className="mt-2 text-neutral-500">Join BooksWithYou</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {serverError && (
            <div
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
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

        <p className="mt-6 text-center text-sm text-neutral-500">
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
