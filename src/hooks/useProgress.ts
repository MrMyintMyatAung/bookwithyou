import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { ProfileBrief } from "./useSessions";

// --- Types ---

export interface ProgressWithMember {
  id: string;
  session_id: string;
  member_id: string;
  chapters_completed: number;
  updated_at: string;
  member: ProfileBrief;
}

// --- Queries ---

export function useSessionProgress(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", sessionId, "progress"],
    queryFn: async (): Promise<ProgressWithMember[]> => {
      const { data, error } = await supabase
        .from("progress")
        .select(
          `
          id,
          session_id,
          member_id,
          chapters_completed,
          updated_at,
          member:profiles!member_id(id, username, display_name, avatar_url)
        `
        )
        .eq("session_id", sessionId!);

      if (error) throw error;

      const rows = data as unknown as {
        id: string;
        session_id: string;
        member_id: string;
        chapters_completed: number;
        updated_at: string;
        member: ProfileBrief;
      }[];

      return rows;
    },
    enabled: !!sessionId,
    staleTime: 10_000,
  });
}

export function useMyProgress(sessionId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sessions", sessionId, "progress", user?.id],
    queryFn: async (): Promise<{
      id: string;
      chapters_completed: number;
    } | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("progress")
        .select("id, chapters_completed")
        .eq("session_id", sessionId!)
        .eq("member_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId && !!user,
    staleTime: 10_000,
  });
}

// --- Mutations ---

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      chaptersCompleted,
      totalChapters,
    }: {
      sessionId: string;
      chaptersCompleted: number;
      totalChapters?: number;
    }) => {
      if (!user) throw new Error("You must be signed in to log progress.");

      // Client-side validation
      if (chaptersCompleted < 0) {
        throw new Error("Chapters completed must be at least 0.");
      }
      if (totalChapters !== undefined && chaptersCompleted > totalChapters) {
        throw new Error(
          `Cannot exceed ${totalChapters} total chapters.`
        );
      }

      // Upsert: insert if no row, update if row exists
      const { error } = await supabase.from("progress").upsert(
        {
          session_id: sessionId,
          member_id: user.id,
          chapters_completed: chaptersCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id, member_id" }
      );

      if (error) throw error;
    },
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", sessionId, "progress"],
      });
    },
  });
}

// --- Realtime ---

export function useProgressRealtime(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`progress-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["sessions", sessionId, "progress"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}
