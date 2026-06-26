-- Add DELETE policies for sessions and books
-- Hosts can delete their own sessions. Books can be deleted by authenticated users
-- since book cleanup happens after session deletion.

CREATE POLICY "Host can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (host_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);
