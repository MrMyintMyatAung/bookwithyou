export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          chapters: Json
          created_at: string | null
          id: string
          title: string
          total_chapters: number | null
          total_pages: number | null
        }
        Insert: {
          author: string
          chapters?: Json
          created_at?: string | null
          id?: string
          title: string
          total_chapters?: number | null
          total_pages?: number | null
        }
        Update: {
          author?: string
          chapters?: Json
          created_at?: string | null
          id?: string
          title?: string
          total_chapters?: number | null
          total_pages?: number | null
        }
        Relationships: []
      }
      bookshelf_items: {
        Row: {
          author: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["bookshelf_status"]
          title: string
          user_id: string
        }
        Insert: {
          author?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["bookshelf_status"]
          title: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["bookshelf_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookshelf_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          id: string
          parent_id: string | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          id: string
          joined_at: string | null
          member_id: string
          session_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          member_id: string
          session_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          member_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          chapters_completed: number
          current_page: number | null
          id: string
          member_id: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          chapters_completed?: number
          current_page?: number | null
          id?: string
          member_id: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          chapters_completed?: number
          current_page?: number | null
          id?: string
          member_id?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          comment_id: string
          emoji: string
          id: string
          member_id: string
        }
        Insert: {
          comment_id: string
          emoji: string
          id?: string
          member_id: string
        }
        Update: {
          comment_id?: string
          emoji?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          book_id: string
          created_at: string | null
          host_id: string
          id: string
          status: Database["public"]["Enums"]["session_status"]
          title: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["session_visibility"]
        }
        Insert: {
          book_id: string
          created_at?: string | null
          host_id: string
          id?: string
          status?: Database["public"]["Enums"]["session_status"]
          title: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["session_visibility"]
        }
        Update: {
          book_id?: string
          created_at?: string | null
          host_id?: string
          id?: string
          status?: Database["public"]["Enums"]["session_status"]
          title?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["session_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_member_of_session: { Args: { session_id: string }; Returns: boolean }
    }
    Enums: {
      bookshelf_status: "reading" | "want_to_read" | "finished"
      session_status: "active" | "paused" | "completed"
      session_visibility: "public" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type SessionVisibility = Database["public"]["Enums"]["session_visibility"];
export type SessionStatus = Database["public"]["Enums"]["session_status"];
