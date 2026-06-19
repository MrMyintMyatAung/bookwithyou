-- BooksWithYou — Initial Schema
-- Deploy to hosted Supabase project via `supabase db push` or MCP execute_sql

-- Enums
CREATE TYPE session_visibility AS ENUM ('public', 'private');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Books (one per session)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  chapters JSONB NOT NULL DEFAULT '[]',
  total_chapters INTEGER GENERATED ALWAYS AS (jsonb_array_length(chapters)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  title TEXT NOT NULL,
  visibility session_visibility NOT NULL DEFAULT 'public',
  status session_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Memberships (junction: member <-> session)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, member_id)
);

-- Progress (one row per member per session)
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  chapters_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, member_id)
);

-- Comments (flat thread per session)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reactions (emoji on comments)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  emoji TEXT NOT NULL,
  UNIQUE(comment_id, member_id, emoji)
);

-- Indexes
CREATE INDEX idx_sessions_visibility ON sessions(visibility) WHERE visibility = 'public';
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_memberships_session ON memberships(session_id);
CREATE INDEX idx_memberships_member ON memberships(member_id);
CREATE INDEX idx_progress_session ON progress(session_id);
CREATE INDEX idx_comments_session ON comments(session_id, created_at);
CREATE INDEX idx_reactions_comment ON reactions(comment_id);

-- ──────────────────────────────────────────────
-- Profile auto-creation trigger
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      'reader_' || substring(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      'reader_' || substring(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- Helper functions (prevent RLS recursion)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_member_of_session(session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE public.memberships.session_id = $1
    AND public.memberships.member_id = auth.uid()
  );
$$;

-- ──────────────────────────────────────────────
-- Row-Level Security
-- ──────────────────────────────────────────────

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ( (select auth.uid()) = id )
  WITH CHECK ( (select auth.uid()) = id );

-- Books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books from public sessions are viewable by everyone"
  ON books FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.book_id = books.id
      AND sessions.visibility = 'public'
    )
  );

CREATE POLICY "Books from private sessions are viewable by members"
  ON books FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN memberships ON memberships.session_id = sessions.id
      WHERE sessions.book_id = books.id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Private sessions are viewable by members"
  ON sessions FOR SELECT
  TO authenticated
  USING (public.is_member_of_session(sessions.id));

CREATE POLICY "Host can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (host_id = (select auth.uid()));

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK ( (select auth.uid()) = host_id );

CREATE POLICY "Host can update session status"
  ON sessions FOR UPDATE
  TO authenticated
  USING ( (select auth.uid()) = host_id )
  WITH CHECK ( (select auth.uid()) = host_id );

-- Memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships are viewable by session members"
  ON memberships FOR SELECT
  TO authenticated
  USING (public.is_member_of_session(session_id));

CREATE POLICY "Memberships of public sessions are viewable by everyone"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = memberships.session_id
      AND sessions.visibility = 'public'
    )
  );

CREATE POLICY "Authenticated users can join sessions"
  ON memberships FOR INSERT
  TO authenticated
  WITH CHECK ( (select auth.uid()) = member_id );

-- Progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Progress is viewable by session members"
  ON progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.session_id = progress.session_id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT
  TO authenticated
  WITH CHECK ( (select auth.uid()) = member_id );

CREATE POLICY "Users can update own progress"
  ON progress FOR UPDATE
  TO authenticated
  USING ( (select auth.uid()) = member_id )
  WITH CHECK ( (select auth.uid()) = member_id );

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by session members"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.session_id = comments.session_id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Session members can post comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = author_id
    AND EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.session_id = comments.session_id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING ( (select auth.uid()) = author_id );

-- Reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by session members"
  ON reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments
      JOIN memberships ON memberships.session_id = comments.session_id
      WHERE comments.id = reactions.comment_id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Session members can react"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = member_id
    AND EXISTS (
      SELECT 1 FROM comments
      JOIN memberships ON memberships.session_id = comments.session_id
      WHERE comments.id = reactions.comment_id
      AND memberships.member_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING ( (select auth.uid()) = member_id );

-- ──────────────────────────────────────────────
-- Realtime (broadcast changes for live updates)
-- ──────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE progress;
