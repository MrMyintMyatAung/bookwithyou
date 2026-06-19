import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Database, SessionVisibility, SessionStatus, Json } from "../types/database";

// --- Types ---

export type BookRow = Database["public"]["Tables"]["books"]["Row"];

export interface ProfileBrief {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface SessionWithBook {
  id: string;
  host_id: string;
  book_id: string;
  title: string;
  visibility: SessionVisibility;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  book: BookRow;
  host: ProfileBrief;
  memberships: { count: number }[];
}

export interface SessionDetail {
  id: string;
  host_id: string;
  book_id: string;
  title: string;
  visibility: SessionVisibility;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  book: BookRow;
  host: ProfileBrief;
}

export interface SessionMember {
  id: string;
  joined_at: string;
  member: ProfileBrief;
}

export interface CreateSessionInput {
  title: string;
  visibility: SessionVisibility;
  bookTitle: string;
  bookAuthor: string;
  chapters: string[];
}

// --- Constants ---

export const SESSIONS_PAGE_SIZE = 20;

// --- Helpers ---

function toProfileBrief(p: {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}): ProfileBrief {
  return {
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
  };
}

// --- Queries ---

export function usePublicSessions() {
  return useQuery({
    queryKey: ["sessions", "public"],
    queryFn: async (): Promise<SessionWithBook[]> => {
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          book:books(*),
          host:profiles!host_id(id, username, display_name, avatar_url),
          memberships(count)
        `
        )
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(SESSIONS_PAGE_SIZE);

      if (error) throw error;
      return (data ?? []) as unknown as SessionWithBook[];
    },
    staleTime: 15_000,
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: async (): Promise<SessionDetail | null> => {
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          book:books(*),
          host:profiles!host_id(id, username, display_name, avatar_url)
        `
        )
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as SessionDetail | null;
    },
    enabled: !!id,
    staleTime: 15_000,
    retry: false, // Avoid retrying on 406/PGRST116 (not found / no access)
  });
}

export function useSessionMembers(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", sessionId, "members"],
    queryFn: async (): Promise<SessionMember[]> => {
      const { data, error } = await supabase
        .from("memberships")
        .select(
          `
          id,
          joined_at,
          member:profiles!member_id(id, username, display_name, avatar_url)
        `
        )
        .eq("session_id", sessionId!);

      if (error) throw error;

      // Map Supabase nested join into a cleaner shape
      const rows = data as unknown as {
        id: string;
        joined_at: string;
        member: ProfileBrief;
      }[];

      return rows.map((row) => ({
        id: row.id,
        joined_at: row.joined_at,
        member: toProfileBrief(row.member),
      }));
    },
    enabled: !!sessionId,
    staleTime: 15_000,
  });
}

// --- Mutations ---

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      if (!user) throw new Error("You must be signed in to create a session.");

      // 1. Insert the book
      const { data: book, error: bookError } = await supabase
        .from("books")
        .insert({
          title: input.bookTitle,
          author: input.bookAuthor,
          chapters: input.chapters as unknown as Json,
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // 2. Insert the session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          host_id: user.id,
          book_id: book.id,
          title: input.title,
          visibility: input.visibility,
        })
        .select()
        .single();

      if (sessionError) {
        // Clean up orphaned book
        await supabase.from("books").delete().eq("id", book.id);
        throw sessionError;
      }

      // 3. Host auto-joins as a member
      const { error: memberError } = await supabase.from("memberships").insert({
        session_id: session.id,
        member_id: user.id,
      });

      if (memberError) {
        // Clean up orphaned session and book — best effort, may fail
        // A DB trigger for auto-join would be more robust than client-side cleanup
        console.error(
          "Failed to auto-join session. Cleaning up orphaned session and book.",
          memberError.message
        );
        await supabase.from("sessions").delete().eq("id", session.id);
        await supabase.from("books").delete().eq("id", book.id);
        throw new Error("Failed to create session. Please try again.");
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("You must be signed in to join a session.");

      const { error } = await supabase.from("memberships").insert({
        session_id: sessionId,
        member_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", sessionId, "members"],
      });
      queryClient.invalidateQueries({ queryKey: ["sessions", sessionId] });
    },
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: SessionStatus;
    }) => {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ["sessions", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "public"] });
    },
  });
}
