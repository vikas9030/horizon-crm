-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to project images
CREATE POLICY "Project images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow authenticated users to upload project images
CREATE POLICY "Users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images');

-- Allow users to delete project images
CREATE POLICY "Users can delete project images"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images');