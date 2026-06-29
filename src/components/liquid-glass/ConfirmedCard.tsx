import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { useGlassHighlight } from "../../hooks/useGlassHighlight";

export function ConfirmedCard() {
  const { isAuthenticated } = useAuth();
  const { hostRef, highlightRef } = useGlassHighlight<HTMLDivElement>();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const secondHashIdx = hash.indexOf("#", 1);
    const tokenPart = secondHashIdx !== -1 ? hash.substring(secondHashIdx + 1) : "";

    if (tokenPart) {
      const params = new URLSearchParams(tokenPart);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken) {
        if (type === "recovery") {
          setProcessing(false);
          return;
        }

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

    const timeout = setTimeout(() => {
      setProcessing(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const cardStyle = {
    transform: "translateZ(0)",
    isolation: "isolate" as const,
    boxShadow:
      "0 30px 80px -20px rgba(0,0,0,0.75), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.08)",
  };

  // ─── Processing spinner ───
  if (processing && !isAuthenticated && !error) {
    return (
      <motion.div
        ref={hostRef}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.68, 0.2, 1] }}
        className="relative w-[380px] rounded-[32px]"
        style={cardStyle}
      >
        <GlassLayers highlightRef={highlightRef} />
        <div className="relative p-7 text-center py-16">
          <svg className="mx-auto mb-5 size-8 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Confirming your email…
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Hang tight — we're finishing up.
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── Error ───
  if (error && !isAuthenticated) {
    return (
      <motion.div
        ref={hostRef}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.68, 0.2, 1] }}
        className="relative w-[380px] rounded-[32px]"
        style={cardStyle}
      >
        <GlassLayers highlightRef={highlightRef} />

        <div className="relative p-7 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/30">
            <svg className="size-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <p className="mt-4 text-xs text-white/40">
            Try{" "}
            <Link to="/login" className="text-white/70 hover:text-white transition">
              signing in
            </Link>{" "}
            instead.
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── Confirmed! ───
  if (isAuthenticated) {
    return (
      <motion.div
        ref={hostRef}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.68, 0.2, 1] }}
        className="relative w-[380px] rounded-[32px]"
        style={cardStyle}
      >
        <GlassLayers highlightRef={highlightRef} />

        <div className="relative p-7 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <svg className="size-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Email confirmed!
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your account is ready. Start exploring BooksWithYou.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link to="/sessions">
              <button className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-semibold tracking-wide text-white transition active:scale-[0.98]">
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
                    background: "linear-gradient(0deg, rgba(0,0,0,0.18), transparent 100%)",
                  }}
                />
                <span className="absolute inset-x-0 top-0 h-px bg-white/80" />
                <span className="absolute inset-x-6 bottom-0 h-px bg-white/15" />
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                />
                <span className="relative">Browse Sessions</span>
              </button>
            </Link>

            <Link
              to="/"
              className="flex h-12 items-center justify-center rounded-2xl text-sm font-medium text-white/70 ring-1 ring-white/10 bg-white/[0.06] transition-all duration-200 hover:bg-white/[0.12] hover:ring-white/25 hover:text-white active:scale-[0.97]"
            >
              Home
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Not authenticated — prompt to sign in ───
  return (
    <motion.div
      ref={hostRef}
      initial={{ y: 24, scale: 0.98 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative w-[380px] rounded-[32px]"
      style={cardStyle}
    >
      <GlassLayers highlightRef={highlightRef} />

      <div className="relative p-7 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-white/15">
          <svg className="size-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-white">
          Email confirmation
        </h1>
        <p className="mt-2 text-sm text-white/60">
          If you just confirmed your email, try signing in now.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block text-xs text-white/50 hover:text-white/80 transition"
        >
          Sign In
        </Link>
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
