import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useGlassHighlight } from "../../hooks/useGlassHighlight";
import { GlassInput } from "./GlassInput";

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

export function RegisterCard() {
  const { isAuthenticated } = useAuth();
  const { hostRef, highlightRef } = useGlassHighlight<HTMLDivElement>();

  const [showPw, setShowPw] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
      setEmailSent(email);
      setLoading(false);
    }
  };

  // ─── Check your email screen ───
  if (emailSent) {
    return (
      <motion.div
        ref={hostRef}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.68, 0.2, 1] }}
        className="relative w-[380px] rounded-[32px]"
        style={{
          transform: "translateZ(0)",
          isolation: "isolate",
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)",
        }}
      >
        <GlassLayers highlightRef={highlightRef} />

        <div className="relative p-7 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <svg className="size-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Confirmation link sent to{" "}
            <span className="font-medium text-white/80">{emailSent}</span>
          </p>

          <div className="mt-5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-4 py-3 text-left text-xs text-white/60 leading-relaxed">
            <p className="font-semibold text-white/80 mb-1.5">📬 What to do next:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your inbox and find the email</li>
              <li>Click <strong className="text-white/80">"Confirm your email address"</strong></li>
              <li>You'll be signed in and ready to go</li>
            </ol>
            <p className="mt-2 text-white/40">
              Didn't get it? Check spam. Still nothing? Try registering again.
            </p>
          </div>

          <Link
            to="/"
            className="mt-5 inline-block text-xs text-white/50 hover:text-white/80 transition"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── Already signed in ───
  if (isAuthenticated) {
    return (
      <motion.div
        ref={hostRef}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.68, 0.2, 1] }}
        className="relative w-[380px] rounded-[32px]"
        style={{
          transform: "translateZ(0)",
          isolation: "isolate",
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)",
        }}
      >
        <GlassLayers highlightRef={highlightRef} />

        <div className="relative p-7 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <svg className="size-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            You're signed in
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your email has been confirmed. You're all set!
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-xs text-white/50 hover:text-white/80 transition"
          >
            Go to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── Registration form ───
  return (
    <motion.div
      ref={hostRef}
      initial={{ y: 24, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative w-[380px] rounded-[32px]"
      style={{
        transform: "translateZ(0)",
        isolation: "isolate",
        boxShadow:
          "0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)",
      }}
    >
      <GlassLayers highlightRef={highlightRef} />

      <div className="relative p-7">
        <div className="mb-6 flex items-center gap-3">
          <Mark />
          <div className="text-sm font-medium text-white/80 tracking-wide">
            BooksWithYou
          </div>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-white/60">
          Join BooksWithYou and start reading together
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-500/15 ring-1 ring-red-500/25 px-3 py-2 text-xs text-red-300">
              {serverError}
            </div>
          )}

          <GlassInput
            label="Username"
            type="text"
            autoComplete="username"
            placeholder="bookworm42"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            disabled={loading}
          />

          <GlassInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={loading}
          />

          <GlassInput
            label="Password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="inline-flex size-7 items-center justify-center rounded-md text-white/45 hover:text-white/85 transition"
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            }
          />

          <LiquidButton submitting={loading} />
        </form>

        <div className="mt-6 text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white/90 hover:text-white transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Glass layer stack ─── */
function GlassLayers({
  highlightRef,
}: {
  highlightRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="absolute inset-0 rounded-[32px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.04) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.22), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 100%, rgba(0,0,0,0.16), transparent 55%)",
        }}
      />
      <div
        ref={highlightRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(380px circle at var(--gx,50%) var(--gy,0%), rgba(6,182,212,0.15), rgba(8,145,178,0.07) 30%, transparent 60%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}

/* ─── Brand mark ─── */
function Mark() {
  return (
    <div className="relative size-8 rounded-xl overflow-hidden ring-1 ring-white/15">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0891b2 0%, #0e7490 35%, #155e75 65%, #06b6d4 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
    </div>
  );
}

/* ─── Liquid submit button ─── */
function LiquidButton({ submitting }: { submitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-semibold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-90"
    >
      <span className="absolute inset-0 bg-[#0e7490]" />
      <span
        className="absolute inset-0 bg-[length:150%_100%] bg-[position:0%_50%] transition-[background-position] duration-[1200ms] ease-out group-hover:bg-[position:100%_50%]"
        style={{
          backgroundImage:
            "linear-gradient(110deg, #0891b2 0%, #0e7490 40%, #155e75 75%, #06b6d4 100%)",
        }}
      />
      <span
        className="pointer-events-none absolute -inset-10 animate-[liquid-drift_9s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(38% 70% at 12% 40%, rgba(6,182,212,0.35), transparent 60%), radial-gradient(36% 66% at 88% 60%, rgba(8,145,178,0.35), transparent 60%)",
          filter: "blur(16px)",
          willChange: "transform",
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.18), transparent 100%)",
        }}
      />
      <span className="absolute inset-x-0 top-0 h-px bg-white/80" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-white/15" />
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      <span className="relative flex items-center gap-2">
        {submitting ? (
          <>
            <Spinner />
            Creating account…
          </>
        ) : (
          <>
            Create Account
            <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              <Arrow />
            </span>
          </>
        )}
      </span>
    </button>
  );
}

/* ─── Icons ─── */
function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.5 7.6A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
