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
      if (authError.status === 400) {
        setError("Invalid email or password. Please try again.");
      } else if (authError.message?.includes("rate")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Something went wrong. Please try again.");
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
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="mt-2 text-neutral-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {resetSuccess && (
            <div
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700"
              role="alert"
            >
              Password updated successfully! Sign in with your new password.
            </div>
          )}

          {error && (
            <div
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
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

        <p className="mt-6 text-center text-sm text-neutral-500">
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
