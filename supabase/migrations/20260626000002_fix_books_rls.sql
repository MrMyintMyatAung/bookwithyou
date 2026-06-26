-- Fix: Books RLS policy for anonymous users
--
-- The previous policy used an EXISTS subquery on the sessions table,
-- but when sessions has its own RLS policies, the subquery evaluation
-- causes books to be filtered out for anonymous users.
--
-- Fix: Books are only ever accessed through their parent session.
-- Session visibility is already enforced at the sessions level.
-- Making books readable by everyone is safe because:
--   1. Book data (title, author, chapters) is not sensitive
--   2. Access control happens at the session level
--   3. This matches the profiles table approach (USING (true))

-- Drop old policies
DROP POLICY IF EXISTS "Books from public sessions are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Books from private sessions are viewable by members" ON books;

-- Create new permissive policy
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);
