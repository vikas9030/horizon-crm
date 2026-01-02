-- Make the leave-documents bucket public so URLs are accessible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'leave-documents';

-- Add RLS policy to allow authenticated users to read from the bucket
CREATE POLICY "Authenticated users can view leave documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'leave-documents');