import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error.message);
    return null;
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      currentUserIdRef.current = currentUser?.id ?? null;
      if (currentUser) {
        fetchProfile(currentUser.id).then((prof) => {
          if (!cancelled) setProfile(prof);
          if (!cancelled) setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      currentUserIdRef.current = currentUser?.id ?? null;

      if (currentUser) {
        const prof = await fetchProfile(currentUser.id);
        if (!cancelled && currentUserIdRef.current === currentUser.id) {
          setProfile(prof);
        }
      } else {
        setProfile(null);
      }

      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      currentUserIdRef.current = null;
    }
    return { error };
  }, []);

  const value: AuthState = {
    user,
    profile,
    isLoading,
    isAuthenticated: user !== null,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
