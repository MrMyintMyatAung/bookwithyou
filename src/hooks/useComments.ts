import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { ProfileBrief } from "./useSessions";

// --- Types ---

export interface ReactionSummary {
  emoji: string;
  count: number;
  hasMine: boolean;
}

export interface CommentWithAuthor {
  id: string;
  session_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author: ProfileBrief;
  reactions: ReactionSummary[];
}

interface RawReaction {
  id: string;
  comment_id: string;
  member_id: string;
  emoji: string;
}

// --- Queries ---

export function useSessionComments(
  sessionId: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["sessions", sessionId, "comments"],
    queryFn: async (): Promise<CommentWithAuthor[]> => {
      // Fetch comments with author
      const { data: comments, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          author:profiles!author_id(id, username, display_name, avatar_url)
        `
        )
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!comments || comments.length === 0) return [];

      // Fetch all reactions for these comments
      const commentIds = comments.map(
        (c: { id: string }) => c.id
      );
      const { data: reactions, error: rxnError } = await supabase
        .from("reactions")
        .select("*")
        .in("comment_id", commentIds);

      if (rxnError) throw rxnError;

      const allReactions = (reactions || []) as unknown as RawReaction[];

      // Summarize reactions per comment
      const reactionMap = new Map<string, ReactionSummary[]>();
      for (const r of allReactions) {
        const existing = reactionMap.get(r.comment_id) || [];
        const summary = existing.find((s) => s.emoji === r.emoji);
        if (summary) {
          summary.count += 1;
          if (userId && r.member_id === userId) {
            summary.hasMine = true;
          }
        } else {
          existing.push({
            emoji: r.emoji,
            count: 1,
            hasMine: userId != null && r.member_id === userId,
          });
        }
        reactionMap.set(r.comment_id, existing);
      }

      return (comments as unknown as {
        id: string;
        session_id: string;
        author_id: string;
        body: string;
        created_at: string;
        updated_at: string;
        author: ProfileBrief;
      }[]).map((c) => ({
        ...c,
        reactions: reactionMap.get(c.id) || [],
      }));
    },
    enabled: !!sessionId,
    staleTime: 5_000,
  });
}

// --- Mutations ---

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      body,
    }: {
      sessionId: string;
      body: string;
    }) => {
      if (!user) throw new Error("You must be signed in to comment.");

      const { error } = await supabase.from("comments").insert({
        session_id: sessionId,
        author_id: user.id,
        body,
      });

      if (error) throw error;
    },
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", sessionId, "comments"],
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// --- Realtime ---

export function useCommentsRealtime(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`comments-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["sessions", sessionId, "comments"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}
