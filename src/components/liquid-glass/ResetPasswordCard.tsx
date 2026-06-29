import { motion } from "framer-motion";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useGlassHighlight } from "../../hooks/useGlassHighlight";
import { GlassInput } from "./GlassInput";

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}

export function ResetPasswordCard() {
  const navigate = useNavigate();
  const { hostRef, highlightRef } = useGlassHighlight<HTMLDivElement>();

  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setServerError("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setFieldError(passwordError);
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setServerError(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      navigate("/login?reset=success", { replace: true });
    }
  };

  // ─── Checking session spinner ───
  if (checkingSession) {
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
        <div className="relative p-7 flex items-center justify-center py-16">
          <svg className="size-8 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    );
  }

  // ─── Expired / invalid link ───
  if (!hasSession) {
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
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/30">
            <svg className="size-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Link expired or invalid
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            This password reset link is no longer valid. Request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="mt-5 inline-block text-xs text-white/50 hover:text-white/80 transition"
          >
            Request New Link
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── Reset password form ───
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
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm text-white/60">
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-500/15 ring-1 ring-red-500/25 px-3 py-2 text-xs text-red-300">
              {serverError}
            </div>
          )}

          <GlassInput
            label="New Password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError && !confirm ? fieldError : undefined}
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

          <GlassInput
            label="Confirm Password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={fieldError && confirm ? fieldError : undefined}
            disabled={loading}
          />

          <LiquidButton submitting={loading} />
        </form>
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
            Updating…
          </>
        ) : (
          <>
            Update Password
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
