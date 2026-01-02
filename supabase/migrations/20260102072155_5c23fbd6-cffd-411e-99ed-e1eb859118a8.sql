-- Change user_id and approved_by columns from uuid to text to support mock data IDs
ALTER TABLE public.leaves ALTER COLUMN user_id TYPE text;
ALTER TABLE public.leaves ALTER COLUMN approved_by TYPE text;