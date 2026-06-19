-- BooksWithYou — Avatar Storage Setup
-- Creates the avatars bucket + storage RLS policies for profile avatar uploads

-- 1. Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,             -- Public bucket: avatars are public data, direct URLs work
  5242880,          -- 5 MB max per file
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

-- 2. Anyone can view avatars (visitors need to see profile pictures too)
CREATE POLICY "Avatars are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 3. Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- 4. Authenticated users can update (overwrite) avatars
CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- 5. Only the uploader can delete their own avatar file
CREATE POLICY "Owners can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());
