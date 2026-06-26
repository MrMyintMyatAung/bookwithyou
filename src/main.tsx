import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle Supabase auth redirect tokens before React Router processes the URL hash.
// Supabase appends #access_token=...&refresh_token=...&type=signup to the redirect URL.
// With HashRouter, the URL becomes #/route#access_token=xxx&refresh_token=yyy
// We need the Supabase client to extract these tokens early.
import { supabase } from "./lib/supabase";

// give detectSessionInUrl a moment to process any tokens in the URL
const hash = window.location.hash;
const hasAuthTokens = hash.includes("access_token=") || hash.includes("refresh_token=");

if (hasAuthTokens) {
  // Let the Supabase client extract tokens from the URL hash
  // detectSessionInUrl is true in the client config, so just
  // initializing the client should handle it.
  // If not handled yet, access .auth to trigger URL detection
  supabase.auth.getSession();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
