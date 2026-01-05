-- Add rejection_reason column to leaves table
ALTER TABLE public.leaves 
ADD COLUMN rejection_reason text;