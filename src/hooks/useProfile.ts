import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Database } from "../types/database";

// --- Types ---

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProfileWithSessions {
  profile: ProfileRow;
  hostedSessions: {
    id: string;
    title: string;
    visibility: string;
    status: string;
    created_at: string;
  }[];
  joinedSessions: {
    id: string;
    title: string;
    visibility: string;
    status: string;
    created_at: string;
  }[];
}

// --- Queries ---

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ["profiles", username],
    queryFn: async (): Promise<ProfileWithSessions | null> => {
      if (!username) return null;

      // Fetch the profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") return null; // Not found
        throw profileError;
      }

      // Fetch hosted sessions and memberships in parallel
      const [hostedResult, membershipsResult] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, title, visibility, status, created_at")
          .eq("host_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("memberships")
          .select(
            `
            session_id,
            session:sessions!inner(id, title, visibility, status, created_at)
          `
          )
          .eq("member_id", profile.id)
          .order("joined_at", { ascending: false })
          .limit(20),
      ]);

      const joinedSessions = (membershipsResult.data ?? [])
        .map((m: any) => m.session)
        .filter(Boolean);

      return {
        profile,
        hostedSessions: (hostedResult.data ?? []) as any[],
        joinedSessions: joinedSessions as any[],
      };
    },
    enabled: !!username,
    staleTime: 15_000,
  });
}

export function useMySessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profiles", user?.id, "my-sessions"],
    queryFn: async () => {
      if (!user) return { hosted: [], joined: [] };

      // Fetch both in parallel
      const [hostedResult, membershipsResult] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, title, visibility, status, created_at")
          .eq("host_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("memberships")
          .select(
            `
            session_id,
            session:sessions!inner(id, title, visibility, status, created_at)
          `
          )
          .eq("member_id", user.id)
          .order("joined_at", { ascending: false }),
      ]);

      const joined = (membershipsResult.data ?? [])
        .map((m: any) => m.session)
        .filter(Boolean);

      return {
        hosted: (hostedResult.data ?? []) as any[],
        joined: joined as any[],
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

// --- Avatar Upload ---

import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE, mimeToExt } from "../lib/avatars";

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("You must be signed in to update your avatar.");

      // Validate type
      if (!ALLOWED_AVATAR_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
        throw new Error(
          `Unsupported file type "${file.type}". Please upload a PNG, JPEG, WebP, or GIF image.`
        );
      }

      // Validate size
      if (file.size > MAX_AVATAR_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(`File is ${sizeMB} MB. Maximum size is 5 MB.`);
      }

      const ext = mimeToExt(file.type);
      const path = `${user.id}/avatar.${ext}`;

      // 1. Upload file to storage (upsert — overwrites any existing avatar)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // 2. Update profile record with the new path
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user.id)
        .select("id, username, display_name, avatar_url, created_at")
        .single();

      if (updateError) {
        // Profile update failed — try to clean up the uploaded file (best-effort)
        await supabase.storage.from("avatars").remove([path]);
        throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

// --- Remove Avatar ---

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in.");

      // Find the current avatar path to know what to delete from storage
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      const oldPath = profile?.avatar_url;

      // Clear the avatar_url in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Best-effort: delete the file from storage
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

// --- Profile Mutations ---

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      display_name?: string | null;
      avatar_url?: string | null;
    }) => {
      if (!user) throw new Error("You must be signed in to update your profile.");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
