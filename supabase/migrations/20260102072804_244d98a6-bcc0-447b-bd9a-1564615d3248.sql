-- Fix leave document uploads in demo mode by allowing public access to the leave-documents bucket objects
-- NOTE: This is intentionally permissive (demo mode).

-- Ensure bucket exists (no-op if it already exists)
insert into storage.buckets (id, name, public)
values ('leave-documents', 'leave-documents', false)
on conflict (id) do nothing;

-- Policies for storage.objects
-- Allow anyone to read files from the leave-documents bucket
DROP POLICY IF EXISTS "Public can read leave documents" ON storage.objects;
CREATE POLICY "Public can read leave documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'leave-documents');

-- Allow anyone to upload files to the leave-documents bucket
DROP POLICY IF EXISTS "Public can upload leave documents" ON storage.objects;
CREATE POLICY "Public can upload leave documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'leave-documents');

-- (Optional) allow replacing an upload path if needed
DROP POLICY IF EXISTS "Public can update leave documents" ON storage.objects;
CREATE POLICY "Public can update leave documents"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'leave-documents')
WITH CHECK (bucket_id = 'leave-documents');
