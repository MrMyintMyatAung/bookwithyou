import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

// --- Types ---

export type BookshelfStatus = "reading" | "want_to_read" | "finished";

export interface BookshelfItem {
  id: string;
  user_id: string;
  title: string;
  author: string;
  status: BookshelfStatus;
  created_at: string;
}

export const STATUS_OPTIONS: { value: BookshelfStatus; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "want_to_read", label: "Want to Read" },
  { value: "finished", label: "Finished" },
];

// --- Queries ---

export function useBookshelf() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookshelf", user?.id],
    queryFn: async (): Promise<BookshelfItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookshelf_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as BookshelfItem[];
    },
    enabled: !!user,
    staleTime: 10_000,
  });
}

// --- Mutations ---

export function useAddBookshelfItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; author: string; status: BookshelfStatus }) => {
      if (!user) throw new Error("Sign in to add books.");
      const { data, error } = await supabase
        .from("bookshelf_items")
        .insert({
          user_id: user.id,
          title: input.title.trim(),
          author: input.author.trim(),
          status: input.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelf"] });
    },
  });
}

export function useUpdateBookshelfItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; author?: string; status?: BookshelfStatus }) => {
      const { data, error } = await supabase
        .from("bookshelf_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelf"] });
    },
  });
}

export function useDeleteBookshelfItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookshelf_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelf"] });
    },
  });
}
