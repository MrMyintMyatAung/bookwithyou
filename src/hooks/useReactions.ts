import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

// We don't need a separate reaction query — reactions are fetched
// alongside comments in useSessionComments. This hook provides only
// the toggle mutation + realtime subscription.

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      commentId,
      emoji,
    }: {
      commentId: string;
      emoji: string;
      sessionId: string;
    }) => {
      if (!user) throw new Error("You must be signed in to react.");

      // Check if user already has this reaction
      const { data: existing } = await supabase
        .from("reactions")
        .select("id")
        .eq("comment_id", commentId)
        .eq("member_id", user.id)
        .eq("emoji", emoji)
        .maybeSingle();

      if (existing) {
        // Remove reaction (toggle off)
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Add reaction (toggle on)
        const { error } = await supabase
          .from("reactions")
          .insert({
            comment_id: commentId,
            member_id: user.id,
            emoji,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", sessionId, "comments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions", sessionId, "reactions"],
      });
    },
  });
}

export function useReactionsRealtime(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`reactions-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          // Filter by session_id via the comment relationship is not
          // directly supported by Realtime, so we invalidate all reactions
          // for this session's comments
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["sessions", sessionId, "comments"],
          });
          queryClient.invalidateQueries({
            queryKey: ["sessions", sessionId, "reactions"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}
