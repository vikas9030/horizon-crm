-- Add favicon_url column to app_settings
ALTER TABLE public.app_settings 
ADD COLUMN favicon_url text;