-- Bookshelf: personal reading tracker
-- Users track books they're Reading, Want to Read, or have Finished.

CREATE TYPE bookshelf_status AS ENUM ('reading', 'want_to_read', 'finished');

CREATE TABLE bookshelf_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  status bookshelf_status NOT NULL DEFAULT 'want_to_read',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast per-user lookups
CREATE INDEX idx_bookshelf_user ON bookshelf_items(user_id);

-- RLS
ALTER TABLE bookshelf_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookshelf"
  ON bookshelf_items FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can add to own bookshelf"
  ON bookshelf_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own bookshelf"
  ON bookshelf_items FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete from own bookshelf"
  ON bookshelf_items FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
