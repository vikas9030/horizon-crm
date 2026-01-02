-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create leaves table
CREATE TABLE public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'manager', 'staff')),
    leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'annual', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    document_url TEXT,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Staff can view their own leaves
CREATE POLICY "Staff can view own leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Managers can view staff leaves and their own
CREATE POLICY "Managers can view staff and own leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id OR 
    user_role = 'staff'
);

-- Admins can view all leaves
CREATE POLICY "Admins can view all leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (true);

-- Users can create their own leaves
CREATE POLICY "Users can create own leaves"
ON public.leaves
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending leaves
CREATE POLICY "Users can update own pending leaves"
ON public.leaves
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Managers and admins can approve/reject leaves
CREATE POLICY "Managers and admins can update leave status"
ON public.leaves
FOR UPDATE
TO authenticated
USING (true);

-- Storage policies for leave documents
-- Users can upload their own documents
CREATE POLICY "Users can upload own leave documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'leave-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own documents
CREATE POLICY "Users can view own leave documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'leave-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Managers and admins can view all leave documents
CREATE POLICY "Managers and admins can view all leave documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'leave-documents');

-- Create updated_at trigger
CREATE TRIGGER update_leaves_updated_at
BEFORE UPDATE ON public.leaves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();